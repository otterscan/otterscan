import React from "react";
import { use4Bytes } from "../use4Bytes";

type MethodNameProps = {
  data: string;
};

const MethodName: React.FC<MethodNameProps> = ({ data }) => {
  const methodName = use4Bytes(data);

  return (
    <div className="bg-blue-50 rounded-lg px-3 py-1 min-h-full flex items-baseline text-xs max-w-max">
      <p className="truncate" title={methodName}>
        {methodName}
      </p>
    </div>
  );
};

export default React.memo(MethodName);
