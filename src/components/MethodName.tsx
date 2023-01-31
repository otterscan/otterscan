import React from "react";
import { useMethodSelector } from "../use4Bytes";

type MethodNameProps = {
  data: string;
};

const MethodName: React.FC<MethodNameProps> = ({ data }) => {
  const [isSimpleTransfer, methodName, methodTitle] = useMethodSelector(data);

  return (
    <div
      className={`${
        isSimpleTransfer ? "bg-amber-100" : "bg-blue-50"
      } flex min-h-full max-w-max items-baseline rounded-lg px-3 py-1 text-xs`}
    >
      <p className="truncate" title={methodTitle}>
        {methodName}
      </p>
    </div>
  );
};

export default React.memo(MethodName);
