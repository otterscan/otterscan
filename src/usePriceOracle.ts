import { useEffect, useMemo, useState } from "react";
import { JsonRpcProvider, BlockTag } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";
import FeedRegistryInterface from "@chainlink/contracts/abi/v0.8/FeedRegistryInterface.json";
import { ChecksummedAddress } from "./types";

const FEED_REGISTRY_MAINNET: ChecksummedAddress =
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";

// The USD "token" address for Chainlink feed registry's purposes
const USD = "0x0000000000000000000000000000000000000348";

export const useTokenUSDOracle = (
  provider: JsonRpcProvider | undefined,
  blockTag: BlockTag | undefined,
  tokenAddress: ChecksummedAddress
): [BigNumber | undefined, number | undefined] => {
  const feedRegistry = useMemo(() => {
    // It work works on ethereum mainnet and kovan, see:
    // https://docs.chain.link/docs/feed-registry/
    if (!provider || provider.network.chainId !== 1) {
      return undefined;
    }

    try {
      return new Contract(
        FEED_REGISTRY_MAINNET,
        FeedRegistryInterface,
        provider
      );
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [provider]);

  const [decimals, setDecimals] = useState<number | undefined>();
  useEffect(() => {
    if (!feedRegistry || blockTag === undefined) {
      return;
    }

    const readData = async () => {
      try {
        const _decimals = await feedRegistry.decimals(tokenAddress, USD, {
          blockTag,
        });
        setDecimals(_decimals);
      } catch (err) {
        // Silently ignore on purpose; it means the network or block number does
        // not contain the chainlink feed contract
        return undefined;
      }
    };
    readData();
  }, [feedRegistry, blockTag, tokenAddress]);

  const [latestPriceData, setLatestPriceData] = useState<BigNumber>();
  useEffect(() => {
    if (!feedRegistry || blockTag === undefined) {
      return;
    }

    const readData = async () => {
      try {
        const priceData = await feedRegistry.latestRoundData(
          tokenAddress,
          USD,
          { blockTag }
        );
        setLatestPriceData(BigNumber.from(priceData.answer));
      } catch (err) {
        // Silently ignore on purpose; it means the network or block number does
        // not contain the chainlink feed contract
        return undefined;
      }
    };
    readData();
  }, [feedRegistry, blockTag, tokenAddress]);

  return [latestPriceData, decimals];
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
