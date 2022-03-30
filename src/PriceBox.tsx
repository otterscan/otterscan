import React, { useState, useEffect, useMemo, useContext } from "react";
import { Contract } from "@ethersproject/contracts";
import { commify, formatUnits } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGasPump } from "@fortawesome/free-solid-svg-icons/faGasPump";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";
import { RuntimeContext } from "./useRuntime";
import { formatValue } from "./components/formatter";
import { useLatestBlock } from "./useLatestBlock";
import { useChainInfo } from "./useChainInfo";

const ETH_FEED_DECIMALS = 8;

// TODO: reduce duplication with useETHUSDOracle
const PriceBox: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const { nativeSymbol } = useChainInfo();
  const latestBlock = useLatestBlock(provider);

  const maybeOutdated: boolean =
    latestBlock !== undefined &&
    Date.now() / 1000 - latestBlock.timestamp > 3600;
  const ethFeed = useMemo(
    () =>
      provider &&
      new Contract("eth-usd.data.eth", AggregatorV3Interface, provider),
    [provider]
  );
  const gasFeed = useMemo(
    () =>
      provider &&
      new Contract("fast-gas-gwei.data.eth", AggregatorV3Interface, provider),
    [provider]
  );

  const [latestPriceData, setLatestPriceData] = useState<any>();
  const [latestGasData, setLatestGasData] = useState<any>();
  useEffect(() => {
    if (!ethFeed || !gasFeed) {
      return;
    }

    const readData = async () => {
      const [priceData, gasData] = await Promise.all([
        ethFeed.latestRoundData(),
        await gasFeed.latestRoundData(),
      ]);
      setLatestPriceData(priceData);
      setLatestGasData(gasData);
    };
    readData();
  }, [ethFeed, gasFeed]);

  const [latestPrice, latestPriceTimestamp] = useMemo(() => {
    if (!latestPriceData) {
      return [undefined, undefined];
    }

    const price = latestPriceData.answer.div(10 ** (ETH_FEED_DECIMALS - 2));
    const formattedPrice = commify(formatUnits(price, 2));

    const timestamp = new Date(latestPriceData.updatedAt * 1000);
    return [formattedPrice, timestamp];
  }, [latestPriceData]);

  const [latestGasPrice, latestGasPriceTimestamp] = useMemo(() => {
    if (!latestGasData) {
      return [undefined, undefined];
    }

    const formattedGas = formatValue(latestGasData.answer, 9);
    const timestamp = new Date(latestGasData.updatedAt * 1000);
    return [formattedGas, timestamp];
  }, [latestGasData]);

  return (
    <>
      {latestPriceData && (
        <div
          className={`flex rounded-lg px-2 py-1 space-x-2 ${
            maybeOutdated ? "bg-orange-200" : "bg-gray-100"
          } font-sans text-xs text-gray-800`}
        >
          <span
            title={`${nativeSymbol}/USD last updated at: ${latestPriceTimestamp?.toString()}`}
          >
            {nativeSymbol}: $<span className="font-balance">{latestPrice}</span>
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
