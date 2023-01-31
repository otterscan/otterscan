import React from "react";
import { SyntaxHighlighter, docco } from "../highlight-init";

type ContractProps = {
  content: any;
};

const Contract: React.FC<ContractProps> = ({ content }) => (
  <SyntaxHighlighter
    className="h-full w-full border font-code text-base"
    language="solidity"
    style={docco}
    showLineNumbers
  >
    {content ?? ""}
  </SyntaxHighlighter>
);

export default React.memo(Contract);
