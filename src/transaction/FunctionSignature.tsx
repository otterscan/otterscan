import React from "react";

type FunctionSignatureProps = {
  callType: string;
  sig: string;
};

const FunctionSignature: React.FC<FunctionSignatureProps> = ({
  callType,
  sig,
}) => (
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
);

export default FunctionSignature;
