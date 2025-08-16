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
  faCheckCircle,
  faTimesCircle,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type UseQueryOptions } from "@tanstack/react-query";
import { keccak256, toUtf8Bytes } from "ethers";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { fetchSolc, loadSolc } from "web-solc";
import Alert from "../../../components/Alert";
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
import VerificationStatus from "./VerificationStatus";

function parseSolidityVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const regex = /(\d+)\.(\d+)\.(\d+)/;
  const match = version.match(regex);
  if (!match) {
    throw new Error("Unknown Solidity version format: " + version);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export const fetchSolcQuery = (
  version: string,
  baseUrl: string,
): UseQueryOptions<string> => ({
  queryKey: ["solc", baseUrl, version],
  queryFn: () =>
    fetchSolc(version, {
      repository: {
        baseUrl,
      },
    }),
});

class Solc implements ISolidityCompiler {
  private solc: string;

  constructor(solc: string) {
    this.solc = solc;
  }

  async compile(
    version: string,
    solcJsonInput: SolidityJsonInput,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // TODO: Separate into its own function to create a separate "Downloading compiler" step
    try {
      const { compile } = await loadSolc(this.solc);
      return await compile(solcJsonInput);
    } catch (e) {
      const { major, minor, patch } = parseSolidityVersion(version);
      if (major === 0 && (minor < 4 || (minor === 4 && patch < 11))) {
        throw new Error("Solidity version not supported (too old): " + version);
      }
      throw e;
    }
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
      name: "Downloading Compiler",
      description: "Loading the Solidity compiler",
      completed: false,
    },
    {
      name: "Verifying Contract",
      description: "Compiling locally in the browser",
      completed: false,
    },
    { name: "Reporting Verification", completed: false },
  ]);
  const { sourcifySource } = useAppConfigContext();
  const sourcifySources = useSourcifySources();
  const [result, setResult] = useState<{
    node: ReactNode;
    isError?: boolean;
  } | null>(null);

  const { provider, config } = useContext(RuntimeContext);
  const compilerBaseUrl =
    config.externalDataSources?.contractCompilerBaseURL ??
    "https://binaries.soliditylang.org";

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
        updateStep(0, { inProgress: false, completed: false, hasError: true });
        setResult({
          node: "No Sourcify match found for this contract.",
          isError: true,
        });
        return;
      }
      const metadata = match.metadata as unknown as Metadata;
      if (!metadata) {
        updateStep(0, { inProgress: false, completed: false, hasError: true });
        setResult({
          node: "Metadata not found in match response.",
          isError: true,
        });
        return;
      }

      const sources = match.metadata.sources;
      try {
        for (const filename in sources) {
          if (sources.hasOwnProperty(filename)) {
            setResult({ node: `Fetching ${filename}` });
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
              setResult({
                node: `Hash mismatch for ${filename}. Got ${calculatedHash}, but ${sources[filename].keccak256} in the metadata`,
                isError: true,
              });
              updateStep(0, {
                inProgress: false,
                completed: false,
                hasError: true,
              });
              return;
            }

            sources[filename] = {
              ...sources[filename],
              content: content,
            };
          }
        }
      } catch (e: any) {
        setResult({
          node: (
            <>
              <strong>Failed to fetch sources:</strong> {e.toString()}
            </>
          ),
          isError: true,
        });
        updateStep(0, { inProgress: false, completed: false, hasError: true });
        return;
      }
      setResult({ node: "" });
      updateStep(0, { inProgress: false, completed: true });

      // Step 2: Compiling Contract
      updateStep(1, { inProgress: true, completed: false });

      let solc: string;
      try {
        solc = await queryClient.fetchQuery(
          fetchSolcQuery(metadata.compiler.version, compilerBaseUrl),
        );
      } catch (e: any) {
        setResult({
          node: (
            <>
              <strong>Failed to download compiler:</strong> {e.toString()}
            </>
          ),
          isError: true,
        });
        updateStep(1, { inProgress: false, completed: false, hasError: true });
        return;
      }

      let metadataContract: SolidityMetadataContract;
      let compilation: SolidityCompilation;
      try {
        metadataContract = new SolidityMetadataContract(metadata, []);
        compilation = await metadataContract.createCompilation(
          new Solc(solc),
        );
      } catch (e: any) {
        setResult({
          node: "Failed to create compilation: " + e.toString(),
          isError: true,
        });
        updateStep(1, { inProgress: false, completed: false, hasError: true });
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
        setResult({
          node: (
            <>
              <strong>Failed to verify contract:</strong> {e.toString()}
            </>
          ),
          isError: true,
        });
        updateStep(2, { inProgress: false, completed: false, hasError: true });
        return;
      }

      updateStep(2, { inProgress: false, completed: true });

      // Step 4: Exporting Verification
      updateStep(3, { inProgress: true, completed: false });

      const exportedVerification = verification.export();
      console.log("Verification result:", exportedVerification);
      const runtimeMatch = exportedVerification.status.runtimeMatch;
      const creationMatch = exportedVerification.status.creationMatch;

      setResult({
        node:
          runtimeMatch === "partial" || runtimeMatch === "perfect" ? (
            <div>
              <div className="mb-1 font-bold">Local verification result:</div>
              <div className="flex items-center gap-3">
                <VerificationStatus runtimeMatch={runtimeMatch} />
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
      });

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
      <div className="pt-4">
        {result !== null &&
          (result.isError === true ? (
            <Alert
              className="bg-red-100 border-red-500 text-red-700"
              icon={faWarning}
            >
              {result.node}
            </Alert>
          ) : (
            result.node
          ))}
      </div>
    </div>
  );
};

export default ContractVerificationSteps;
