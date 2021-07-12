import React, { useContext } from "react";
import { RuntimeContext } from "./useRuntime";

const Footer: React.FC = () => {
  const { provider } = useContext(RuntimeContext);

  return (
    <div className="w-full px-2 py-1 border-t border-t-gray-100 text-xs bg-link-blue text-gray-200 text-center">
      {provider ? (
        <>Using Erigon node at {provider.connection.url}</>
      ) : (
        <>Waiting for the provider...</>
      )}
    </div>
  );
};

export default React.memo(Footer);
