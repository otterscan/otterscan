import React, { useState, useEffect, useMemo, useContext } from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGasPump } from "@fortawesome/free-solid-svg-icons";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";
import { RuntimeContext } from "./useRuntime";

const ETH_FEED_DECIMALS = 8;

const PriceBox: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const ethFeed = useMemo(
    () =>
      provider &&
      new ethers.Contract("eth-usd.data.eth", AggregatorV3Interface, provider),
    [provider]
  );
  const gasFeed = useMemo(
    () =>
      provider &&
      new ethers.Contract(
        "fast-gas-gwei.data.eth",
        AggregatorV3Interface,
        provider
      ),
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

  return (
    <>
      {latestPriceData && (
        <div className="flex rounded-lg px-2 py-1 space-x-2 bg-gray-100 font-sans text-xs text-gray-800">
          <span>
            Eth: $
            <span className="font-balance">
              {ethers.utils.commify(
                ethers.utils.formatUnits(
                  latestPriceData.answer,
                  ETH_FEED_DECIMALS
                )
              )}
            </span>
          </span>
          {latestGasData && (
            <>
              <span>|</span>
              <span className="text-gray-400">
                <FontAwesomeIcon icon={faGasPump} size="1x" />
                <span className="ml-1">
                  {ethers.utils.formatUnits(latestGasData.answer, "gwei")} Gwei
                </span>
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default React.memo(PriceBox);
