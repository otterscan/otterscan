import { FC } from "react";
import FiatValue, { rewardPreset } from "../../components/FiatValue";
import NativeTokenAmount from "../../components/NativeTokenAmount";
import { ExtendedBlock } from "../../useErigonHooks";
import { useFiatValue } from "../../usePriceOracle";

type BlockRewardProps = {
  block: ExtendedBlock;
};

const BlockReward: FC<BlockRewardProps> = ({ block }) => {
  const totalFees = block?.feeReward ?? 0n;

  // Optimism-specific: subtract deposit transaction's gas, which does not pay the basefee
  const gasUsedWithoutDepositTx =
    block.gasUsed - (block.gasUsedDepositTx ?? 0n);
  const burntFees =
    (block?.baseFeePerGas && block.baseFeePerGas * gasUsedWithoutDepositTx) ??
    0n;
  const netFeeReward = totalFees - burntFees;

  const totalReward = block.blockReward + netFeeReward;
  const fiatValue = useFiatValue(totalReward, block.number);

  return (
    <>
      <NativeTokenAmount value={totalReward} />
      {netFeeReward !== 0n && (
        <>
          {" "}
          (
          <NativeTokenAmount
            data-test="block-reward"
            value={block.blockReward}
            hideUnit
          />{" "}
          + <NativeTokenAmount value={netFeeReward} hideUnit />)
        </>
      )}
      {fiatValue && (
        <>
          {" "}
          <FiatValue value={fiatValue} {...rewardPreset} />
        </>
      )}
    </>
  );
};

export default BlockReward;
