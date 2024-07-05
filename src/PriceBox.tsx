import { faGasPump } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FixedNumber, JsonRpcApiProvider } from "ethers";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { formatValue } from "./components/formatter";
import { useChainInfo } from "./useChainInfo";
import { useLatestBlockHeader } from "./useLatestBlock";
import {
  formatFiatValue,
  useETHUSDRawOracle,
  useFastGasRawOracle,
} from "./usePriceOracle";
import { RuntimeContext } from "./useRuntime";

// TODO: encapsulate this magic number
const ETH_FEED_DEFAULT_DECIMALS = 8n;

async function blockNearestToDate(
  provider: JsonRpcApiProvider,
  date: Date,
  maxBlockNumber?: number,
): Promise<number | null> {
  let low = 0;
  let high = maxBlockNumber ?? (await provider.getBlockNumber());

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);

    if (!block || !block.timestamp) {
      return null;
    }

    const blockDate = new Date(block.timestamp * 1000);
    if (blockDate < date) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  // We'll use the earlier block number
  return high;
}

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

  const [prevDayBlock, setPrevDayBlock] = useState<number | null>(null);
  useEffect(() => {
    if (provider === undefined || latestBlock === undefined) {
      return;
    }
    (async function () {
      const yesterday = new Date(latestBlock.timestamp * 1000);
      yesterday.setHours(yesterday.getHours() - 24);
      const prevDayBlockNumber = await blockNearestToDate(
        provider,
        yesterday,
        latestBlock?.number,
      );
      setPrevDayBlock(prevDayBlockNumber);
    })();
  }, [provider, latestBlock !== undefined]);
  const prevDayPriceData = useETHUSDRawOracle(
    provider,
    prevDayBlock ?? undefined,
  );
  const [latestPrice, latestPriceTimestamp, oneDayPriceChange] = useMemo(() => {
    if (!latestPriceData) {
      return [undefined, undefined, undefined];
    }

    const priceDecimals =
      config.priceOracleInfo?.nativeTokenPrice?.ethUSDOracleDecimals ??
      ETH_FEED_DEFAULT_DECIMALS;
    const currentPrice = FixedNumber.fromValue(
      latestPriceData.answer,
      priceDecimals,
    );
    const formattedPrice = formatFiatValue(currentPrice, 2);
    let oneDayPriceChange = undefined;
    if (prevDayPriceData) {
      const prevDayPrice = FixedNumber.fromValue(
        prevDayPriceData.answer,
        priceDecimals,
      );
      oneDayPriceChange = (
        ((currentPrice.toUnsafeFloat() - prevDayPrice.toUnsafeFloat()) /
          prevDayPrice.toUnsafeFloat()) *
        100
      ).toFixed(2);
      if (currentPrice.gte(prevDayPrice)) {
        oneDayPriceChange = "+" + oneDayPriceChange;
      }
    }

    const timestamp = new Date(Number(latestPriceData.updatedAt) * 1000);
    return [formattedPrice, timestamp, oneDayPriceChange];
  }, [latestPriceData, prevDayPriceData, prevDayBlock]);

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
            {oneDayPriceChange ? (
              <span
                className={`ml-0.5 ${oneDayPriceChange.startsWith("+") ? "text-green-500" : "text-red-500"}`}
              >
                {" "}
                ({oneDayPriceChange}%)
              </span>
            ) : null}
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
