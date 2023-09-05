import { FC } from "react";
import NativeTokenAmount from "../../components/NativeTokenAmount";
import FiatValue, { rewardPreset } from "../../components/FiatValue";
import { ExtendedBlock } from "../../useErigonHooks";
import { useFiatValue } from "../../usePriceOracle";

type BlockRewardProps = {
  block: ExtendedBlock;
};

const BlockReward: FC<BlockRewardProps> = ({ block }) => {
  const netFeeReward = block?.feeReward ?? 0n;
  const totalReward = block.blockReward + netFeeReward;
  const fiatValue = useFiatValue(totalReward, block.number);

  return (
    <>
      <NativeTokenAmount value={totalReward} />
      {netFeeReward !== 0n && (
        <>
          {" "}
          (<NativeTokenAmount value={block.blockReward} hideUnit /> +{" "}
          <NativeTokenAmount value={netFeeReward} hideUnit />)
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
