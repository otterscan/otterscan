import { FC } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import TransactionValue from "./TransactionValue";
import FiatValue from "./FiatValue";
import { useFiatValue } from "../usePriceOracle";

type TransactionDetailsValueProps = {
  value: BigNumber;
  blockTag: BlockTag | undefined;
};

const TransactionDetailsValue: FC<TransactionDetailsValueProps> = ({
  value,
  blockTag,
}) => {
  const fiatValue = useFiatValue(value, blockTag);

  return (
    <>
      <TransactionValue value={value} />
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
