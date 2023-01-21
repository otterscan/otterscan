import { FC } from "react";
import FormattedBalance from "../components/FormattedBalance";
import FiatValue from "../components/FiatValue";
import { useFiatValue } from "../usePriceOracle";
import { useChainInfo } from "../useChainInfo";
import { ConfirmedTransactionData } from "../types";

type TransactionFeeProps = {
  confirmedData: ConfirmedTransactionData;
};

const TransactionFee: FC<TransactionFeeProps> = ({ confirmedData }) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const fiatValue = useFiatValue(confirmedData.fee, confirmedData.blockNumber);

  return (
    <>
      <FormattedBalance value={confirmedData.fee} /> {symbol}{" "}
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

export default TransactionFee;
