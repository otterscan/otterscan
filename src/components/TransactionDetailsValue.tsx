import React, { useContext } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import FormattedBalance from "./FormattedBalance";
import { RuntimeContext } from "../useRuntime";
import { useChainInfo } from "../useChainInfo";
import { useETHUSDOracle } from "../usePriceOracle";
import FiatValue from "./FiatValue";

type TransactionDetailsValueProps = {
  blockTag: BlockTag | undefined;
  value: BigNumber;
};

const TransactionDetailsValue: React.FC<TransactionDetailsValueProps> = ({
  blockTag,
  value,
}) => {
  const { provider } = useContext(RuntimeContext);
  const blockETHUSDPrice = useETHUSDOracle(provider, blockTag);
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const fiatValue =
    !value.isZero() && blockETHUSDPrice !== undefined
      ? value.mul(blockETHUSDPrice).div(10 ** 8)
      : undefined;

  return (
    <>
      <FormattedBalance value={value} /> {symbol}{" "}
      {fiatValue && (
        <FiatValue
          value={fiatValue}
          borderColor="border-skin-from"
          bgColor="bg-skin-from"
          fgColor="text-skin-from"
        />
      )}
    </>
  );
};

export default TransactionDetailsValue;
