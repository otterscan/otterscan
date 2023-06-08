import { FC } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import TransactionValue from "./TransactionValue";
import FiatValue, { FiatBoxProps } from "./FiatValue";
import { useFiatValue } from "../usePriceOracle";

type TransactionDetailsValueProps = FiatBoxProps & {
  value: BigNumber;
  blockTag: BlockTag | undefined;
};

const TransactionDetailsValue: FC<TransactionDetailsValueProps> = ({
  value,
  blockTag,
  ...rest
}) => {
  const fiatValue = useFiatValue(value, blockTag);

  return (
    <span className="space-x-2">
      <TransactionValue value={value} />
      {fiatValue && <FiatValue value={fiatValue} {...rest} />}
    </span>
  );
};

export default TransactionDetailsValue;
