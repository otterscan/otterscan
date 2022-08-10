import React from "react";
import { SyntaxHighlighter, docco } from "../highlight-init";
import { useContract } from "../sourcify/useSourcify";
import { useAppConfigContext } from "../useAppConfig";

type ContractFromRepoProps = {
  checksummedAddress: string;
  networkId: number;
  filename: string;
};

const ContractFromRepo: React.FC<ContractFromRepoProps> = ({
  checksummedAddress,
  networkId,
  filename,
}) => {
  const { sourcifySource } = useAppConfigContext();
  const content = useContract(
    checksummedAddress,
    networkId,
    filename,
    sourcifySource
  );

  return (
    <SyntaxHighlighter
      className="w-full h-full border font-code text-base"
      language="solidity"
      style={docco}
      showLineNumbers
    >
      {content ?? ""}
    </SyntaxHighlighter>
  );
};

export default React.memo(ContractFromRepo);
