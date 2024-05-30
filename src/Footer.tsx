import React, { useContext } from "react";
import { RuntimeContext } from "./useRuntime";

const Footer: React.FC = () => {
  const { provider, config } = useContext(RuntimeContext);

  return (
    <div
      className={`w-full border-t border-t-gray-100 px-2 py-1 text-xs ${
        provider?._network.chainId === 1n
          ? "bg-link-blue text-gray-200 dark:text-gray-900"
          : "bg-orange-400 text-white dark:text-black"
      } text-center`}
    >
      {provider ? (
        <>Using Erigon node at {config?.erigonURL}</>
      ) : (
        <>Waiting for the provider...</>
      )}
    </div>
  );
};

export default React.memo(Footer);
