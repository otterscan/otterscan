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
        <span className="px-2 border-skin-from border rounded-lg bg-skin-from text-skin-from">
          <FiatValue value={fiatValue} />
        </span>
      )}
    </>
  );
};

export default TransactionDetailsValue;
