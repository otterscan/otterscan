import { FC } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import FormattedBalance from "./FormattedBalance";
import FiatValue from "./FiatValue";
import { useChainInfo } from "../useChainInfo";
import { useFiatValue } from "../usePriceOracle";

type TransactionDetailsValueProps = {
  blockTag: BlockTag | undefined;
  value: BigNumber;
};

const TransactionDetailsValue: FC<TransactionDetailsValueProps> = ({
  blockTag,
  value,
}) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const fiatValue = useFiatValue(value, blockTag);

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
