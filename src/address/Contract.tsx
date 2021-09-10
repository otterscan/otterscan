import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import hljs from "highlight.js";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import { useContract } from "../useSourcify";

import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);

type ContractProps = {
  checksummedAddress: string;
  networkId: number;
  filename: string;
  source: any;
  useIPFS: boolean;
};

const Contract: React.FC<ContractProps> = ({
  checksummedAddress,
  networkId,
  filename,
  source,
  useIPFS,
}) => {
  const content = useContract(
    checksummedAddress,
    networkId,
    filename,
    source,
    useIPFS
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
