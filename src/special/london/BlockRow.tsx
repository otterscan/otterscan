import React from "react";
import { FixedNumber, formatEther } from "ethers";
import BlockLink from "../../components/BlockLink";
import TimestampAge from "../../components/TimestampAge";
import Blip from "./Blip";
import { ExtendedBlock } from "../../useErigonHooks";
import { useChainInfo } from "../../useChainInfo";
import { commify } from "../../utils/utils";

const ELASTICITY_MULTIPLIER = 2n;

type BlockRowProps = {
  block: ExtendedBlock;
  baseFeeDelta: number;
};

const BlockRow: React.FC<BlockRowProps> = ({ block, baseFeeDelta }) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const gasTarget = block.gasLimit / ELASTICITY_MULTIPLIER;
  const burntFees = block?.baseFeePerGas && block.baseFeePerGas * block.gasUsed;
  const netFeeReward = block && block.feeReward - (burntFees ?? 0n);
  const totalReward = block.blockReward + (netFeeReward ?? 0n);

  return (
    <div className="grid grid-cols-9 gap-x-2 px-3 py-2 hover:bg-skin-table-hover">
      <div>
        <BlockLink blockTag={block.number} />
      </div>
      <div
        className={`col-span-2 text-right ${
          block.gasUsed > gasTarget
            ? "text-emerald-500"
            : block.gasUsed < gasTarget
            ? "text-red-500"
            : ""
        }`}
      >
        {commify(block.gasUsed.toString())} (
        {block.gasUsed > gasTarget ? "+" : ""}
        {FixedNumber.fromValue(block.gasUsed)
          .subUnsafe(FixedNumber.fromValue(gasTarget))
          .mulUnsafe(FixedNumber.fromValue(100))
          .divUnsafe(FixedNumber.fromValue(gasTarget))
          .round(2)
          .toUnsafeFloat()}
        %)
      </div>
      <div className="text-right">
        <div className="relative">
          <span>
            {FixedNumber.fromValue(block.baseFeePerGas ?? 0n)
              .divUnsafe(FixedNumber.fromValue(1_000_000_000n))
              .toUnsafeFloat()
              .toFixed(2)}{" "}
            Gwei
          </span>
          <Blip value={baseFeeDelta} />
        </div>
      </div>
      <div className="col-span-2 text-right">
        {commify(formatEther(totalReward))} {symbol}
      </div>
      <div className="col-span-2 text-right text-orange-500 line-through">
        {commify(formatEther(block.gasUsed * block.baseFeePerGas!))} {symbol}
      </div>
      <div className="text-right text-gray-400">
        <TimestampAge timestamp={block.timestamp} />
      </div>
    </div>
  );
};

export default React.memo(BlockRow);
