import React, { useEffect, useState } from "react";
import { JsonRpcProvider, Block } from "@ethersproject/providers";
import { commify } from "../../utils/utils";

type CountdownProps = {
  provider: JsonRpcProvider;
  currentBlock: Block;
  targetBlock: number;
};

const Countdown: React.FC<CountdownProps> = ({
  provider,
  currentBlock,
  targetBlock,
}) => {
  const [targetTimestamp, setTargetTimestamp] = useState<number>();

  useEffect(() => {
    const calcTime = async () => {
      const diff = targetBlock - currentBlock.number;
      const _prevBlock = await provider.getBlock(currentBlock.number - diff);
      const _targetTimestamp =
        currentBlock.timestamp +
        (currentBlock.timestamp - _prevBlock.timestamp);
      setTargetTimestamp(_targetTimestamp);
    };
    calcTime();
  }, [provider, currentBlock, targetBlock]);

  return (
    <div className="flex h-full w-full">
      <div className="m-auto text-center">
        <h1 className="mb-10 text-6xl">London Network Upgrade</h1>
        <h2 className="text-5xl">
          {commify(targetBlock - currentBlock.number)}
        </h2>
        <h6 className="mb-10 text-sm">Blocks remaining</h6>
        <h2 className="mb-10 inline-flex space-x-10 text-base">
          <div>Current block: {commify(currentBlock.number)}</div>
          <div>Target block: {commify(targetBlock)}</div>
        </h2>
        {targetTimestamp && (
          <div className="text-lg">
            {new Date(targetTimestamp * 1000).toLocaleDateString()} @{" "}
            {new Date(targetTimestamp * 1000).toLocaleTimeString()} (Estimative)
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Countdown);
