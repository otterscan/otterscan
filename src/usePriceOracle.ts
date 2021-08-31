import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider, BlockTag } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";

export const useETHUSDOracle = (
  provider: JsonRpcProvider | undefined,
  blockTag: BlockTag | undefined
) => {
  const ethFeed = useMemo(() => {
    if (!provider || provider.network.chainId !== 1) {
      return undefined;
    }

    try {
      return new Contract("eth-usd.data.eth", AggregatorV3Interface, provider);
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [provider]);

  const [latestPriceData, setLatestPriceData] = useState<BigNumber>();
  useEffect(() => {
    if (!ethFeed || !blockTag) {
      return;
    }

    const readData = async () => {
      try {
        const priceData = await ethFeed.latestRoundData({ blockTag });
        setLatestPriceData(BigNumber.from(priceData.answer));
      } catch (err) {
        console.error(err);
      }
    };
    readData();
  }, [ethFeed, blockTag]);

  return latestPriceData;
};
