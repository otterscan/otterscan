import React, { useContext } from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import TransactionValue from "./components/TransactionValue";
import FiatValue from "./components/FiatValue";
import { RuntimeContext } from "./useRuntime";
import { ExtendedBlock } from "./useErigonHooks";
import { useETHUSDOracle } from "./usePriceOracle";

type BlockRewardProps = {
  block: ExtendedBlock;
};

const BlockReward: React.FC<BlockRewardProps> = ({ block }) => {
  const { provider } = useContext(RuntimeContext);
  const eth2USDValue = useETHUSDOracle(provider, block.number);

  const netFeeReward = block?.feeReward ?? BigNumber.from(0);
  const value = eth2USDValue
    ? FixedNumber.fromValue(
        block.blockReward
          .add(netFeeReward)
          .mul(eth2USDValue)
          .div(10 ** 8),
        18
      )
    : undefined;
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
      {value && (
        <>
          {" "}
          <FiatValue
            value={value}
            borderColor="border-amber-200"
            bgColor="bg-amber-100"
            fgColor="text-amber-600"
          />
        </>
      )}
    </>
  );
};

export default BlockReward;
