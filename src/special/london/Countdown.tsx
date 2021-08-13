import React, { useEffect, useState } from "react";
import { JsonRpcProvider, Block } from "@ethersproject/providers";
import { commify } from "@ethersproject/units";

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
    <div className="w-full h-full flex">
      <div className="m-auto text-center">
        <h1 className="text-6xl mb-10">London Network Upgrade</h1>
        <h2 className="text-5xl">
          {commify(targetBlock - currentBlock.number)}
        </h2>
        <h6 className="text-sm mb-10">Blocks remaining</h6>
        <h2 className="inline-flex space-x-10 text-base mb-10">
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
