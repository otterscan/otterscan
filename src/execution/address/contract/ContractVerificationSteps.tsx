import { SolidityJsonInput } from "@ethereum-sourcify/compilers-types";
import {
  ISolidityCompiler,
  Metadata,
  SolidityCompilation,
  SolidityMetadataContract,
  SourcifyChain,
  Verification,
} from "@ethereum-sourcify/lib-sourcify";
import {
  faCheck,
  faCheckCircle,
  faCheckDouble,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { keccak256, toUtf8Bytes } from "ethers";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { fetchSolc } from "web-solc";
import StepByStep, { useStepManagement } from "../../../components/StepByStep";
import { queryClient } from "../../../queryClient";
import {
  getContractQuery,
  getSourcifyMetadataQuery,
  resolveSourcifySource,
  transformContractResponse,
  useSourcifySources,
} from "../../../sourcify/useSourcify";
import { useAppConfigContext } from "../../../useAppConfig";
import { RuntimeContext } from "../../../useRuntime";

class Solc implements ISolidityCompiler {
  async compile(
    version: string,
    solcJsonInput: SolidityJsonInput,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // TODO: Separate into its own function to create a separate "Downloading compiler" step
    const { compile } = await fetchSolc(version);
    return await compile(solcJsonInput);
  }
}

interface ContractVerificationStepsProps {
  address: string;
}

const ContractVerificationSteps: React.FC<ContractVerificationStepsProps> = ({
  address,
}) => {
  const { steps, updateStep, clearSteps } = useStepManagement([
    {
      name: "Fetching Sources",
      description: "Downloading from Sourcify",
      completed: false,
    },
    {
      name: "Compiling Contract",
      description: "Compiling locally in the browser",
      completed: false,
    },
    {
      name: "Verifying Contract",
      description: "Executing verification logic in the browser",
      completed: false,
    },
    { name: "Reporting Verification", completed: false },
  ]);
  const { sourcifySource } = useAppConfigContext();
  const sourcifySources = useSourcifySources();
  const [result, setResult] = useState<ReactNode | null>(null);

  const { provider, config } = useContext(RuntimeContext);

  useEffect(() => {
    const verifyContract = async () => {
      clearSteps();
      updateStep(0, { inProgress: true, completed: false });

      const rpcUrl = config.erigonURL;
      if (!rpcUrl) {
        console.warn("Manual contract verification: Erigon URL not found");
        return;
      }

      // Get contract creation transaction
      // TODO: Fold into a getContractCreatorQuery function in useErigonHooks
      let creationTx: undefined | string = undefined;
      try {
        const creatorResult = await provider.send("ots_getContractCreator", [
          address,
        ]);
        if (creatorResult !== null) {
          creationTx = creatorResult.hash ?? undefined;
        }
        console.log("Creation tx hash:", creationTx);
      } catch (e) {
        console.warn("Failed to fetch creation tx");
      }

      const match = await queryClient.fetchQuery(
        getSourcifyMetadataQuery(
          sourcifySources,
          sourcifySource,
          address,
          provider._network.chainId,
          false,
        ),
      );
      if (!match) {
        setResult("No Sourcify match found for this contract.");
        return;
      }
      const metadata = match.metadata as unknown as Metadata;
      if (!metadata) {
        setResult("Metadata not found in match response.");
        return;
      }

      const sources = match.metadata.sources;
      for (const filename in sources) {
        if (sources.hasOwnProperty(filename)) {
          setResult(`Fetching ${filename}`);
          let content = await queryClient.fetchQuery(
            getContractQuery(
              sourcifySources,
              sourcifySource,
              address,
              provider._network.chainId,
              filename,
              sources[filename].keccak256,
              match.type,
            ),
          );
          // Error if content is undefined!
          content = content ?? "";
          const resolvedSourcifySource = resolveSourcifySource(
            sourcifySource,
            sourcifySources,
          );
          content = transformContractResponse(
            content,
            filename,
            resolvedSourcifySource.sourcifySource,
          );
          const calculatedHash = keccak256(toUtf8Bytes(content));
          if (calculatedHash !== sources[filename].keccak256) {
            setResult(
              `Hash mismatch for ${filename}. Got ${calculatedHash}, but ${sources[filename].keccak256} in the metadata`,
            );
            return;
          }

          sources[filename] = {
            ...sources[filename],
            content: content,
          };
        }
      }
      setResult("");
      updateStep(0, { inProgress: false, completed: true });

      // Step 2: Compiling Contract
      updateStep(1, { inProgress: true, completed: false });

      let metadataContract: SolidityMetadataContract;
      let compilation: SolidityCompilation;
      try {
        metadataContract = new SolidityMetadataContract(metadata, []);
        compilation = await metadataContract.createCompilation(new Solc());
      } catch (e: any) {
        setResult("Failed to create compilation: " + e.toString());
        return;
      }
      updateStep(1, { inProgress: false, completed: true });

      // Step 3: Verifying contract
      updateStep(2, { inProgress: true, completed: false });

      const myChain = new SourcifyChain({
        name: "Ethereum Mainnet",
        chainId: Number(provider._network.chainId),
        rpc: [rpcUrl],
        supported: true,
      });

      let verification: Verification;
      try {
        verification = new Verification(
          compilation,
          myChain,
          address,
          creationTx,
        );
        await verification.verify();
      } catch (e: any) {
        setResult(
          <>
            <strong>Failed to verify contract:</strong> {e.toString()}
          </>,
        );
        updateStep(2, { inProgress: false, completed: false });
        return;
      }

      updateStep(2, { inProgress: false, completed: true });

      // Step 4: Exporting Verification
      updateStep(3, { inProgress: true, completed: false });

      const exportedVerification = verification.export();
      console.log("Verification result:", exportedVerification);
      const runtimeMatch = exportedVerification.status.runtimeMatch;
      const creationMatch = exportedVerification.status.creationMatch;

      const explainer =
        runtimeMatch === "perfect"
          ? "Exact match: The onchain and compiled bytecode match exactly, including the metadata hashes."
          : "Match: The onchain and compiled bytecode match, but metadata hashes differ or don't exist.";

      setResult(
        runtimeMatch === "partial" || runtimeMatch === "perfect" ? (
          <div>
            <div className="mb-1 font-bold">Local verification result:</div>
            <div className="flex items-center gap-3">
              <div
                className="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 rounded-md font-semibold border bg-green-100 text-green-800 border-green-200 text-sm w-auto flex-shrink-0 md:text-base"
                title={explainer}
              >
                {" "}
                <FontAwesomeIcon
                  icon={runtimeMatch === "perfect" ? faCheckDouble : faCheck}
                />{" "}
                {runtimeMatch === "perfect" && "Exact "}Match
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <FontAwesomeIcon
                    className="self-center text-emerald-500"
                    icon={faCheckCircle}
                  />{" "}
                  runtime bytecode
                </div>
                <div className="flex gap-1">
                  {creationMatch === "partial" ||
                  creationMatch === "perfect" ? (
                    <FontAwesomeIcon
                      className="self-center text-emerald-500"
                      icon={faCheckCircle}
                    />
                  ) : (
                    <FontAwesomeIcon
                      className="self-center text-red-500"
                      icon={faTimesCircle}
                    />
                  )}{" "}
                  creation bytecode
                </div>
              </div>
            </div>
          </div>
        ) : (
          <span>
            <span className="text-lg">❌</span> Local verification failed: It
            might not be safe to interact with this contract. Please report it
            to Sourcify before proceeding.
          </span>
        ),
      );

      updateStep(3, {
        inProgress: false,
        completed: true,
        showDuration: false,
      });
    };

    verifyContract();
  }, [address, sourcifySource]);

  return (
    <div>
      <StepByStep steps={steps} />
      <div className="pt-4">{result}</div>
    </div>
  );
};

export default ContractVerificationSteps;
