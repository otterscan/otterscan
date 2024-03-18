import { faGasPump } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatUnits } from "ethers";
import React, { useContext, useMemo } from "react";
import { formatValue } from "./components/formatter";
import { useChainInfo } from "./useChainInfo";
import { useLatestBlockHeader } from "./useLatestBlock";
import { useETHUSDRawOracle, useFastGasRawOracle } from "./usePriceOracle";
import { RuntimeContext } from "./useRuntime";
import { commify } from "./utils/utils";

// TODO: encapsulate this magic number
const ETH_FEED_DEFAULT_DECIMALS = 8n;

const PriceBox: React.FC = () => {
  const { config, provider } = useContext(RuntimeContext);
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const latestBlock = useLatestBlockHeader(provider);

  const maybeOutdated: boolean =
    latestBlock !== undefined &&
    Date.now() / 1000 - latestBlock.timestamp > 3600;

  const latestPriceData = useETHUSDRawOracle(provider, "latest");
  const [latestPrice, latestPriceTimestamp] = useMemo(() => {
    if (!latestPriceData) {
      return [undefined, undefined];
    }

    const price: bigint =
      latestPriceData.answer /
      10n **
        (BigInt(
          config?.priceOracleInfo?.chainlink?.ethUSDOracleDecimals ??
            ETH_FEED_DEFAULT_DECIMALS,
        ) -
          2n);
    const formattedPrice = commify(formatUnits(price, 2));

    const timestamp = new Date(Number(latestPriceData.updatedAt) * 1000);
    return [formattedPrice, timestamp];
  }, [latestPriceData]);

  const latestGasData = useFastGasRawOracle(provider, "latest");
  const [latestGasPrice, latestGasPriceTimestamp] = useMemo(() => {
    if (!latestGasData) {
      return [undefined, undefined];
    }

    const formattedGas = formatValue(latestGasData.answer, 9);
    const timestamp = new Date(Number(latestGasData.updatedAt) * 1000);
    return [formattedGas, timestamp];
  }, [latestGasData]);

  return (
    <>
      {latestPriceData && (
        <div
          className={`flex space-x-2 rounded-lg px-2 py-1 ${
            maybeOutdated ? "bg-orange-200" : "bg-gray-100"
          } font-sans text-xs text-gray-800`}
        >
          <span
            title={`${symbol}/USD last updated at: ${latestPriceTimestamp?.toString()}`}
          >
            {symbol}: $<span className="font-balance">{latestPrice}</span>
          </span>
          {latestGasData && (
            <>
              <span>|</span>
              <span
                className="text-gray-400"
                title={`Fast gas price last updated at: ${latestGasPriceTimestamp?.toString()}`}
              >
                <FontAwesomeIcon icon={faGasPump} size="1x" />
                <span className="ml-1">{latestGasPrice} Gwei</span>
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default React.memo(PriceBox);
