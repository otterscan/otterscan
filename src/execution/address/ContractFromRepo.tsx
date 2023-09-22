import React from "react";
import { SyntaxHighlighter, docco } from "../../highlight-init";
import { MatchType, useContract } from "../../sourcify/useSourcify";
import { useAppConfigContext } from "../../useAppConfig";
import PendingItem from "./PendingItem";

type ContractFromRepoProps = {
  checksummedAddress: string;
  networkId: bigint;
  filename: string;
  type: MatchType;
};

const ContractFromRepo: React.FC<ContractFromRepoProps> = ({
  checksummedAddress,
  networkId,
  filename,
  type,
}) => {
  const { sourcifySource } = useAppConfigContext();
  const content = useContract(
    checksummedAddress,
    networkId,
    filename,
    sourcifySource,
    type
  );

  return (
    <>
      {content === undefined && (
        <>
          <div className="h-screen w-full border">
            <PendingItem large={true} />
          </div>
        </>
      )}
      {content !== undefined && (
        <SyntaxHighlighter
          className="h-full w-full border font-code text-base"
          language="solidity"
          style={docco}
          showLineNumbers
        >
          {content ?? ""}
        </SyntaxHighlighter>
      )}
    </>
  );
};

export default React.memo(ContractFromRepo);
