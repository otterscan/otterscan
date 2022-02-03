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
