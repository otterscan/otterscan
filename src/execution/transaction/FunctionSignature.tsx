import React from "react";
import SelectionHighlighter, {
  functionSigSelector,
} from "../../selection/SelectionHighlighter";

type FunctionSignatureProps = {
  callType: string;
  sig: string;
};

const FunctionSignature: React.FC<FunctionSignatureProps> = ({
  callType,
  sig,
}) => (
  <SelectionHighlighter
    myType="functionSig"
    myContent={sig}
    selector={functionSigSelector}
  >
    <span
      className={`font-bold ${
        callType === "STATICCALL"
          ? "text-red-700"
          : callType === "DELEGATECALL" || callType === "CALLCODE"
            ? "text-gray-400"
            : "text-blue-900"
      }`}
    >
      {sig}
    </span>
  </SelectionHighlighter>
);

export default FunctionSignature;
