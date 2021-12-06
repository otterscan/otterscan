import React from "react";
import { SyntaxHighlighter, docco } from "../highlight-init";
import { useContract } from "../sourcify/useSourcify";
import { useAppConfigContext } from "../useAppConfig";

type ContractProps = {
  checksummedAddress: string;
  networkId: number;
  filename: string;
  source: any;
};

const Contract: React.FC<ContractProps> = ({
  checksummedAddress,
  networkId,
  filename,
  source,
}) => {
  const { sourcifySource } = useAppConfigContext();
  const content = useContract(
    checksummedAddress,
    networkId,
    filename,
    source,
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

export default React.memo(Contract);
