import { BlockTag } from "ethers";
import { FC } from "react";
import { useFiatValue } from "../usePriceOracle";
import FiatValue, { FiatBoxProps } from "./FiatValue";
import NativeTokenAmount from "./NativeTokenAmount";

type NativeTokenAmountAndFiatProps = FiatBoxProps & {
  value: bigint;
  blockTag?: BlockTag;
};

/**
 * Standard box combining the display of a certain amount of native tokens
 * (i.e. ETH) followed by its equivalent in fiat (given the chain has an on-chain
 * oracle available).
 */
const NativeTokenAmountAndFiat: FC<NativeTokenAmountAndFiatProps> = ({
  value,
  blockTag = "latest",
  ...rest
}) => {
  const fiatValue = useFiatValue(value, blockTag);

  return (
    <span className="space-x-2">
      <NativeTokenAmount value={value} />
      {fiatValue && <FiatValue value={fiatValue} {...rest} />}
    </span>
  );
};

export default NativeTokenAmountAndFiat;
