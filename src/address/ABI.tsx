import React from "react";
import { SyntaxHighlighter, docco } from "../highlight-init";

type ABIProps = {
  abi: any[];
};

const ABI: React.FC<ABIProps> = ({ abi }) => (
  <SyntaxHighlighter
    className="w-full h-60 border font-code text-base"
    language="json"
    style={docco}
    showLineNumbers
  >
    {JSON.stringify(abi, null, "  ") ?? ""}
  </SyntaxHighlighter>
);

export default React.memo(ABI);
