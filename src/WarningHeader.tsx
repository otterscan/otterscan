import React, { useContext } from "react";
import { RuntimeContext } from "./useRuntime";

const WarningHeader: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const chainId = provider?._network.chainId;
  if (chainId === 1n) {
    return <></>;
  }

  let chainMsg = `ChainID: ${chainId}`;
  if (chainId === 3n) {
    chainMsg = "Ropsten Testnet";
  } else if (chainId === 4n) {
    chainMsg = "Rinkeby Testnet";
  } else if (chainId === 5n) {
    chainMsg = "Görli Testnet";
  } else if (chainId === 42n) {
    chainMsg = "Kovan Testnet";
  } else if (chainId === 11155111n) {
    chainMsg = "Sepolia Testnet";
  }
  return (
    <div className="w-full bg-orange-400 px-2 py-1 text-center font-bold text-white">
      You are on {chainMsg}
    </div>
  );
};

export default React.memo(WarningHeader);
