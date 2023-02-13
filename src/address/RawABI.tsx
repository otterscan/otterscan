import { FC, memo } from "react";
import { SyntaxHighlighter, docco } from "../highlight-init";

type RawABIProps = {
  abi: any[];
};

const RawABI: FC<RawABIProps> = ({ abi }) => (
  <SyntaxHighlighter
    className="h-60 w-full border font-code text-base"
    language="json"
    style={docco}
    showLineNumbers
  >
    {JSON.stringify(abi, null, "  ") ?? ""}
  </SyntaxHighlighter>
);

export default memo(RawABI);
