import React from "react";
import { FixedNumber } from "@ethersproject/bignumber";
import { commify, formatEther } from "@ethersproject/units";
import BlockLink from "../../components/BlockLink";
import TimestampAge from "../../components/TimestampAge";
import { ChartBlock } from "./chart";
import Blip from "./Blip";

const ELASTICITY_MULTIPLIER = 2;

type BlockRowProps = {
  now: number;
  block: ChartBlock;
  baseFeeDelta: number;
};

const BlockRow: React.FC<BlockRowProps> = ({ now, block, baseFeeDelta }) => {
  const gasTarget = block.gasLimit.div(ELASTICITY_MULTIPLIER);
  const burntFees =
    block?.baseFeePerGas && block.baseFeePerGas.mul(block.gasUsed);
  const netFeeReward = block && block.feeReward.sub(burntFees ?? 0);
  const totalReward = block.blockReward.add(netFeeReward ?? 0);

  return (
    <div className="grid grid-cols-9 gap-x-2 px-3 py-2 hover:bg-gray-100">
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
        {commify(block.gasUsed.toString())}
      </div>
      <div className="text-right text-gray-400">
        {commify(gasTarget.toString())}
      </div>
      <div className="text-right">
        <div className="relative">
          <span>
            {FixedNumber.from(block.baseFeePerGas)
              .divUnsafe(FixedNumber.from(1e9))
              .round(0)
              .toUnsafeFloat()}{" "}
            <span className="text-xs text-gray-500">Gwei</span>
          </span>
          <Blip value={baseFeeDelta} />
        </div>
      </div>
      <div className="text-right col-span-2">
        {commify(formatEther(totalReward))} Ether
      </div>
      <div className="text-right col-span-2 line-through text-orange-500">
        {commify(formatEther(block.gasUsed.mul(block.baseFeePerGas!)))} Ether
      </div>
      <div className="text-right text-gray-400">
        <TimestampAge now={now / 1000} timestamp={block.timestamp} />
      </div>
    </div>
  );
};

export default React.memo(BlockRow);
