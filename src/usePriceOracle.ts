import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider, BlockTag } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";

export const useETHUSDOracle = (
  provider: JsonRpcProvider | undefined,
  blockTag: BlockTag | undefined
) => {
  const blockTags = useMemo(() => [blockTag], [blockTag]);
  const priceMap = useMultipleETHUSDOracle(provider, blockTags);

  if (blockTag === undefined) {
    return undefined;
  }
  return priceMap[blockTag];
};

export const useMultipleETHUSDOracle = (
  provider: JsonRpcProvider | undefined,
  blockTags: (BlockTag | undefined)[]
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

  const [latestPriceData, setLatestPriceData] = useState<
    Record<BlockTag, BigNumber>
  >({});
  useEffect(() => {
    if (!ethFeed) {
      return;
    }

    const priceReaders: Promise<BigNumber | undefined>[] = [];
    for (const blockTag of blockTags) {
      priceReaders.push(
        (async () => {
          try {
            const priceData = await ethFeed.latestRoundData({ blockTag });
            return BigNumber.from(priceData.answer);
          } catch (err) {
            console.error(err);
            return undefined;
          }
        })()
      );
    }
    const readData = async () => {
      const results = await Promise.all(priceReaders);
      const priceMap: Record<BlockTag, BigNumber> = {};
      for (let i = 0; i < blockTags.length; i++) {
        const blockTag = blockTags[i];
        const result = results[i];
        if (blockTag === undefined || result === undefined) {
          continue;
        }

        priceMap[blockTag] = result;
      }

      setLatestPriceData(priceMap);
    };
    readData();
  }, [ethFeed, blockTags]);

  return latestPriceData;
};
