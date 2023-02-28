import { FC, memo } from "react";
import { SyntaxHighlighter, docco } from "../../../highlight-init";
import { ABIAwareComponentProps } from "../../types";

const RawABI: FC<ABIAwareComponentProps> = ({ abi }) => (
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
