import React, { useContext } from "react";
import { useChainInfo } from "./useChainInfo";
import { RuntimeContext } from "./useRuntime";

const WarningHeader: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const { name } = useChainInfo();
  const chainId = provider._network.chainId;
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
  } else if (chainId === 10n) {
    chainMsg = "OP Mainnet";
  } else if (chainId === 42n) {
    chainMsg = "Kovan Testnet";
  } else if (chainId === 100n) {
    chainMsg = "Gnosis Chain";
  } else if (chainId === 137n) {
    chainMsg = "Polygon Mainnet";
  } else if (chainId === 10200n) {
    chainMsg = "Chiado Testnet";
  } else if (chainId === 80001n) {
    chainMsg = "Mumbai Testnet";
  } else if (chainId === 80002n) {
    chainMsg = "Amoy Testnet";
  } else if (chainId === 11155111n) {
    chainMsg = "Sepolia Testnet";
  } else if (chainId === 11155420n) {
    chainMsg = "OP Sepolia";
  } else if (chainId === 17000n) {
    chainMsg = "Holesky Testnet";
  } else if (name) {
    chainMsg = name;
  }

  return (
    <div
      className="w-full bg-orange-400 px-2 py-1 text-center font-bold text-white dark:text-gray-900"
      data-test="warning-header-network-name"
    >
      You are on {chainMsg}
    </div>
  );
};

export default React.memo(WarningHeader);
