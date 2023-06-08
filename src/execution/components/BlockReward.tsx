import { FC } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import TransactionValue from "../../components/TransactionValue";
import FiatValue, { rewardPreset } from "../../components/FiatValue";
import { ExtendedBlock } from "../../useErigonHooks";
import { useFiatValue } from "../../usePriceOracle";

type BlockRewardProps = {
  block: ExtendedBlock;
};

const BlockReward: FC<BlockRewardProps> = ({ block }) => {
  const netFeeReward = block?.feeReward ?? BigNumber.from(0);
  const totalReward = block.blockReward.add(netFeeReward);
  const fiatValue = useFiatValue(totalReward, block.number);

  return (
    <>
      <TransactionValue value={block.blockReward.add(netFeeReward)} />
      {!netFeeReward.isZero() && (
        <>
          {" "}
          (<TransactionValue value={block.blockReward} hideUnit /> +{" "}
          <TransactionValue value={netFeeReward} hideUnit />)
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
