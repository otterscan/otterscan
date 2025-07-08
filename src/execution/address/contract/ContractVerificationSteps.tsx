import { SolidityJsonInput } from "@ethereum-sourcify/compilers-types";
import {
  ISolidityCompiler,
  Metadata,
  SolidityMetadataContract,
  SourcifyChain,
  Verification,
} from "@ethereum-sourcify/lib-sourcify";
import { keccak256, toUtf8Bytes } from "ethers";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { fetchSolc } from "web-solc";
import StepByStep, { Step } from "../../../components/StepByStep";
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
  const [steps, setSteps] = useState<Step[]>([
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
      // Step 1: Fetching sources
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 0
            ? { ...step, inProgress: true }
            : { ...step, completed: false },
        ),
      );

      const rpcUrl = config.erigonURL;
      if (!rpcUrl) {
        console.warn("Manual contract verification: Erigon URL not found");
        return;
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

      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 0 ? { ...step, completed: true, inProgress: false } : step,
        ),
      );

      // Step 2: Compiling Contract
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 1 ? { ...step, inProgress: true } : step,
        ),
      );

      const metadataContract = new SolidityMetadataContract(metadata, []);
      const isCompilable = await metadataContract.isCompilable();
      const compilation = await metadataContract.createCompilation(new Solc());

      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 1 ? { ...step, completed: true, inProgress: false } : step,
        ),
      );

      // Step 3: Verifying contract
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 2 ? { ...step, inProgress: true } : step,
        ),
      );

      const myChain = new SourcifyChain({
        name: "Ethereum Mainnet",
        chainId: Number(provider._network.chainId),
        rpc: [rpcUrl],
        supported: true,
      });

      const verification = new Verification(compilation, myChain, address);
      await verification.verify();

      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 2 ? { ...step, completed: true, inProgress: false } : step,
        ),
      );

      // Step 4: Exporting Verification
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 3 ? { ...step, inProgress: true } : step,
        ),
      );

      const exportedVerification = verification.export();
      console.log("Verification result:", exportedVerification);
      const goodMatch =
        exportedVerification.status.runtimeMatch === "partial" ||
        exportedVerification.status.runtimeMatch === "perfect";

      setResult(
        goodMatch ? (
          <span>
            <span className="text-lg">✅</span> Local verification confirmed
            Sourcify’s result
          </span>
        ) : (
          <span>
            <span className="text-lg">❌</span> Local verification failed: It
            might not be safe to interact with this contract. Please report it
            to Sourcify before proceeding.
          </span>
        ),
      );

      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 3 ? { ...step, completed: true, inProgress: false } : step,
        ),
      );
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
