import { FC, memo } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { useChainInfo } from "../useChainInfo";
import { formatFiatValue, useFiatValue } from "../usePriceOracle";

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
  const value = formatFiatValue(nativeTokenPrice);

  return (
    <span className="text-sm">
      {value ? (
        <>
          $<span className="font-balance">{value}</span>
          <span className="text-xs opacity-50"> / {symbol}</span>
        </>
      ) : (
        "N/A"
      )}
    </span>
  );
};

export default memo(NativeTokenPrice);
