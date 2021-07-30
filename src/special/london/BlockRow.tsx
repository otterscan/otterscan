import { ethers } from "ethers";
import React from "react";
import BlockLink from "../../components/BlockLink";
import TimestampAge from "../../components/TimestampAge";
import { ExtendedBlock } from "../../useErigonHooks";

const ELASTICITY_MULTIPLIER = 2;

type BlockRowProps = {
  now: number;
  block: ExtendedBlock;
};

const BlockRow: React.FC<BlockRowProps> = ({ now, block }) => {
  const gasTarget = block.gasLimit.div(ELASTICITY_MULTIPLIER);
  const burntFees =
    block?.baseFeePerGas && block.baseFeePerGas.mul(block.gasUsed);
  const netFeeReward = block && block.feeReward.sub(burntFees ?? 0);
  const totalReward = block.blockReward.add(netFeeReward ?? 0);

  return (
    <div className="grid grid-cols-8 px-3 py-2 hover:bg-gray-100">
      <div>
        <BlockLink blockTag={block.number} />
      </div>
      <div
        className={`text-right ${
          block.gasUsed.gt(gasTarget)
            ? "text-green-500"
            : block.gasUsed.lt(gasTarget)
            ? "text-red-500"
            : ""
        }`}
      >
        {ethers.utils.commify(block.gasUsed.toString())}
      </div>
      <div className="text-right text-gray-400">
        {ethers.utils.commify(gasTarget.toString())}
      </div>
      <div className="text-right">{block.baseFeePerGas?.toString()} wei</div>
      <div className="text-right col-span-2">
        {ethers.utils.commify(ethers.utils.formatEther(totalReward))} Ether
      </div>
      <div className="text-right line-through text-orange-500">
        {ethers.utils.commify(
          ethers.utils.formatUnits(
            block.gasUsed.mul(block.baseFeePerGas!).toString(),
            9
          )
        )}{" "}
        Gwei
      </div>
      <div className="text-right text-gray-400">
        <TimestampAge now={now / 1000} timestamp={block.timestamp} />
      </div>
    </div>
  );
};

export default React.memo(BlockRow);
