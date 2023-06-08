import { FC, memo } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";
import { useChainInfo } from "../useChainInfo";
import { useFiatValue } from "../usePriceOracle";

const TEN = BigNumber.from(10);

type NativeTokenPriceProps = {
  blockTag: BlockTag | undefined;
};

/**
 * This component displays the fiat price of the native chain token along with formatting, e.g.,
 * "$1,500.00 /ETH".
 *
 * The quote is get from internal oracle system.
 */
const NativeTokenPrice: FC<NativeTokenPriceProps> = ({ blockTag }) => {
  const {
    nativeCurrency: { symbol, decimals },
  } = useChainInfo();

  // One unit of native token, considering decimals
  const nativeTokenPrice = useFiatValue(TEN.pow(decimals), blockTag);

  let value: string | undefined;
  if (nativeTokenPrice) {
    value = commify(nativeTokenPrice.round(2).toString());

    // little hack: commify removes trailing decimal zeros
    const parts = value.split(".");
    if (parts.length == 2) {
      value = value + "0".repeat(2 - parts[1].length);
    }
  }

  return (
    <span className="text-sm">
      {value ? (
        <>
          $<span className="font-balance">{value}</span>
          <span className="text-xs text-gray-500"> / {symbol}</span>
        </>
      ) : (
        "N/A"
      )}
    </span>
  );
};

export default memo(NativeTokenPrice);
