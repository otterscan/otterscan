import React, { useContext } from "react";
import FormattedBalance from "../components/FormattedBalance";
import FiatValue from "../components/FiatValue";
import { RuntimeContext } from "../useRuntime";
import { useETHUSDOracle } from "../usePriceOracle";
import { useChainInfo } from "../useChainInfo";
import { ConfirmedTransactionData } from "../types";

type TransactionFeeProps = {
  confirmedData: ConfirmedTransactionData;
};

const TransactionFee: React.FC<TransactionFeeProps> = ({ confirmedData }) => {
  const { provider } = useContext(RuntimeContext);
  const blockETHUSDPrice = useETHUSDOracle(provider, confirmedData.blockNumber);
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const fiatValue =
    blockETHUSDPrice !== undefined
      ? confirmedData.fee.mul(blockETHUSDPrice).div(10 ** 8)
      : undefined;

  return (
    <>
      <FormattedBalance value={confirmedData.fee} /> {symbol}{" "}
      {fiatValue && (
        <span className="px-2 border-skin-from border rounded-lg bg-skin-from text-skin-from">
          <FiatValue value={fiatValue} />
        </span>
      )}
    </>
  );
};

export default TransactionFee;
