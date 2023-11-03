import React from "react";
import { useMethodSelector } from "../use4Bytes";

type MethodNameProps = {
  data: string;
  to?: string;
};

const MethodName: React.FC<MethodNameProps> = ({ data, to = undefined }) => {
  const [isSimpleTransfer, methodName, methodTitle, fromVerifiedContract] =
    useMethodSelector(data, to);

  return (
    <div
      className={`${
        isSimpleTransfer ? "bg-amber-100" : "bg-blue-50"
      } flex min-h-full max-w-max items-baseline rounded-lg px-3 py-1 text-xs`}
    >
      <p
        className={`truncate ${
          fromVerifiedContract ? "text-verified-contract" : ""
        }`}
        title={methodTitle}
      >
        {methodName}
      </p>
    </div>
  );
};

export default React.memo(MethodName);
