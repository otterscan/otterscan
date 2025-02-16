import { BlockTag, FixedNumber } from "ethers";
import { FC } from "react";
import { useFiatValue } from "../usePriceOracle";
import FiatValue, { FiatBoxProps, neutralPreset } from "./FiatValue";

type NativeTokenAmountOnlyFiatProps = FiatBoxProps & {
  value: bigint;
  blockTag?: BlockTag;
};

/**
 * A variant of NativeTokenAmountAndFiat that does not show the native token amount.
 */
const NativeTokenAmountOnlyFiat: FC<NativeTokenAmountOnlyFiatProps> = ({
  value,
  blockTag = "latest",
  ...rest
}) => {
  const fiatValue = useFiatValue(value, blockTag);

  return (
    <>
      {value !== 0n ? (
        fiatValue ? (
          <FiatValue value={fiatValue} {...rest} />
        ) : (
          <span className="font-balance text-xs text-gray-500">N/A</span>
        )
      ) : (
        <div className="opacity-30">
          <FiatValue value={FixedNumber.fromValue(0n, 18)} {...neutralPreset} />
        </div>
      )}
    </>
  );
};

export default NativeTokenAmountOnlyFiat;
