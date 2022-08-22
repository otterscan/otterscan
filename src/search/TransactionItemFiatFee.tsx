import React, { useContext } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import FiatValue from "../components/FiatValue";
import { RuntimeContext } from "../useRuntime";
import { useETHUSDOracle } from "../usePriceOracle";

type TransactionItemFiatFeeProps = {
  blockTag: BlockTag;
  fee: BigNumber;
};

const TransactionItemFiatFee: React.FC<TransactionItemFiatFeeProps> = ({
  blockTag,
  fee,
}) => {
  const { provider } = useContext(RuntimeContext);
  const eth2USDValue = useETHUSDOracle(provider, blockTag);
  const fiatValue =
    eth2USDValue !== undefined ? fee.mul(eth2USDValue).div(10 ** 8) : undefined;

  return fiatValue ? <FiatValue value={fiatValue} /> : <>N/A</>;
};

export default TransactionItemFiatFee;
