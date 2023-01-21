import { FC, memo, useContext } from "react";
import { BlockTag } from "@ethersproject/providers";
import { FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";
import { useChainInfo } from "../useChainInfo";
import { RuntimeContext } from "../useRuntime";
import { useETHUSDOracle } from "../usePriceOracle";

const ETH_FEED_DECIMALS = 8;

type USDValueProps = {
  blockTag: BlockTag | undefined;
};

const USDValue: FC<USDValueProps> = ({ blockTag }) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const { provider } = useContext(RuntimeContext);
  const blockETHUSDPrice = useETHUSDOracle(provider, blockTag);
  const value = blockETHUSDPrice;

  return (
    <span className="text-sm">
      {value ? (
        <>
          $
          <span className="font-balance">
            {commify(
              FixedNumber.fromValue(value, ETH_FEED_DECIMALS)
                .round(2)
                .toString()
            )}
          </span>{" "}
          <span className="text-xs text-gray-500">/ {symbol}</span>
        </>
      ) : (
        "N/A"
      )}
    </span>
  );
};

export default memo(USDValue);
