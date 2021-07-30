import React, { useContext } from "react";
import { useLatestBlock } from "../../useLatestBlock";
import { RuntimeContext } from "../../useRuntime";
import Countdown from "./Countdown";
import Blocks from "./Blocks";
import { londonBlockNumber } from "./params";

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

  return <Blocks latestBlock={block} targetBlockNumber={targetBlockNumber} />;
};

export default React.memo(London);
