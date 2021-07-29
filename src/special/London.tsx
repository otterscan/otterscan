import React, { useContext } from "react";
import { useLatestBlock } from "../useLatestBlock";
import { RuntimeContext } from "../useRuntime";
import Countdown from "./Countdown";

const londonBlockNumber: { [chainId: string]: number } = {
  "1": 12965000,
  "3": 10499401,
  "4": 8897988,
  "5": 5062605,
};

const London: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const block = useLatestBlock(provider);
  if (!provider || !block) {
    return <></>;
  }

  // Display countdown
  const targetBlockNumber =
    londonBlockNumber[provider.network.chainId.toString()];
  if (block.number < targetBlockNumber) {
    return (
      <Countdown
        provider={provider}
        currentBlock={block}
        targetBlock={targetBlockNumber}
      />
    );
  }

  return <div className="w-full h-full"></div>;
};

export default React.memo(London);
