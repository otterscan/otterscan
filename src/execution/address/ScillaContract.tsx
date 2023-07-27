import React from "react";
import { SyntaxHighlighter, docco } from "../../highlight-init";

type ContractProps = {
  content: any;
};

const ScillaContract: React.FC<ContractProps> = ({ content }) => (
  <SyntaxHighlighter
    className="h-full w-full border font-code text-base"
    language="scilla"
    style={docco}
    showLineNumbers
  >
    {content ?? ""}
  </SyntaxHighlighter>
);

export default React.memo(ScillaContract);
