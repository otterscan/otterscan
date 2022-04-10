import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider, BlockTag } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";
import FeedRegistryInterface from "@chainlink/contracts/abi/v0.8/FeedRegistryInterface.json";
import useSWRImmutable from "swr/immutable";
import { ChecksummedAddress } from "./types";

const FEED_REGISTRY_MAINNET: ChecksummedAddress =
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";

// The USD "token" address for Chainlink feed registry's purposes
const USD = "0x0000000000000000000000000000000000000348";

const feedRegistryFetcherKey = (
  tokenAddress: ChecksummedAddress,
  blockTag: BlockTag | undefined
): [ChecksummedAddress, BlockTag] | null => {
  if (blockTag === undefined) {
    return null;
  }
  return [tokenAddress, blockTag];
};

const feedRegistryFetcher =
  (provider: JsonRpcProvider | undefined) =>
  async (
    tokenAddress: ChecksummedAddress,
    blockTag: BlockTag
  ): Promise<[BigNumber | undefined, number | undefined]> => {
    // It work works on ethereum mainnet and kovan, see:
    // https://docs.chain.link/docs/feed-registry/
    if (!provider || provider.network.chainId !== 1) {
      return [undefined, undefined];
    }

    try {
      const feedRegistry = new Contract(
        FEED_REGISTRY_MAINNET,
        FeedRegistryInterface,
        provider
      );
      const priceData = await feedRegistry.latestRoundData(tokenAddress, USD, {
        blockTag,
      });
      const quote = BigNumber.from(priceData.answer);
      const decimals = await feedRegistry.decimals(tokenAddress, USD, {
        blockTag,
      });
      return [quote, decimals];
    } catch (err) {
      console.error(err);
      return [undefined, undefined];
    }
  };

export const useTokenUSDOracle = (
  provider: JsonRpcProvider | undefined,
  blockTag: BlockTag | undefined,
  tokenAddress: ChecksummedAddress
): [BigNumber | undefined, number | undefined] => {
  const fetcher = feedRegistryFetcher(provider);
  const { data, error } = useSWRImmutable(
    feedRegistryFetcherKey(tokenAddress, blockTag),
    fetcher
  );
  if (error) {
    return [undefined, undefined];
  }
  return data ?? [undefined, undefined];
};

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
    // TODO: it currently is hardcoded to support only mainnet
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
            // Silently ignore on purpose; it means the network or block number does
            // not contain the chainlink feed contract
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
