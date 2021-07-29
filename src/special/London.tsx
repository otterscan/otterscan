import React, { useContext } from "react";
import { useLatestBlock } from "../useLatestBlock";
import { RuntimeContext } from "../useRuntime";
import Countdown from "./Countdown";

const londonBlockNumber = 12965000;

const London: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const block = useLatestBlock(provider);
  if (!block) {
    return <></>;
  }

  // Display countdown
  if (provider && block.number < londonBlockNumber) {
    return (
      <Countdown
        provider={provider}
        currentBlock={block}
        targetBlock={londonBlockNumber}
      />
    );
  }

  return <div className="w-full h-full"></div>;
};

export default React.memo(London);
