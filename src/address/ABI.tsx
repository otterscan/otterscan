import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import hljs from "highlight.js";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";

import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);

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
