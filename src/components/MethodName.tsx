import React from "react";
import { use4Bytes } from "../use4Bytes";

type MethodNameProps = {
  data: string;
};

const MethodName: React.FC<MethodNameProps> = ({ data }) => {
  const rawFourBytes = data.slice(0, 10);
  const methodName = use4Bytes(rawFourBytes);
  const isSimpleTransfer = data === "0x";
  const methodTitle = isSimpleTransfer
    ? "ETH Transfer"
    : methodName === rawFourBytes
    ? methodName
    : `${methodName} [${rawFourBytes}]`;

  return (
    <div
      className={`${
        isSimpleTransfer ? "bg-yellow-100" : "bg-blue-50"
      } rounded-lg px-3 py-1 min-h-full flex items-baseline text-xs max-w-max`}
    >
      <p className="truncate" title={methodTitle}>
        {methodName}
      </p>
    </div>
  );
};

export default React.memo(MethodName);
