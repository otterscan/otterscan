import { JsonRpcProvider, BlockTag } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";
import FeedRegistryInterface from "@chainlink/contracts/abi/v0.8/FeedRegistryInterface.json";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { ChecksummedAddress } from "./types";

const FEED_REGISTRY_MAINNET: ChecksummedAddress =
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";

// The USD "token" address for Chainlink feed registry's purposes
const USD = "0x0000000000000000000000000000000000000348";

type FeedRegistryFetcherKey = [ChecksummedAddress, BlockTag];
type FeedRegistryFetcherData = [BigNumber | undefined, number | undefined];

const feedRegistryFetcherKey = (
  tokenAddress: ChecksummedAddress,
  blockTag: BlockTag | undefined
): FeedRegistryFetcherKey | null => {
  if (blockTag === undefined) {
    return null;
  }
  return [tokenAddress, blockTag];
};

const feedRegistryFetcher =
  (
    provider: JsonRpcProvider | undefined
  ): Fetcher<FeedRegistryFetcherData, FeedRegistryFetcherKey> =>
  async (tokenAddress, blockTag) => {
    // It work works on ethereum mainnet and kovan, see:
    // https://docs.chain.link/docs/feed-registry/
    if (provider!.network.chainId !== 1) {
      throw new Error("FeedRegistry is supported only on mainnet");
    }

    // Let SWR handle error
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

const ethUSDFetcherKey = (blockTag: BlockTag | undefined) => {
  if (blockTag === undefined) {
    return null;
  }
  return ["ethusd", blockTag];
};

const ethUSDFetcher =
  (
    provider: JsonRpcProvider | undefined
  ): Fetcher<BigNumber | undefined, ["ethusd", BlockTag | undefined]> =>
  async (_, blockTag) => {
    if (provider?.network.chainId !== 1) {
      return undefined;
    }
    const c = new Contract("eth-usd.data.eth", AggregatorV3Interface, provider);
    const priceData = await c.latestRoundData({ blockTag });
    return BigNumber.from(priceData.answer);
  };

export const useETHUSDOracle = (
  provider: JsonRpcProvider | undefined,
  blockTag: BlockTag | undefined
): BigNumber | undefined => {
  const fetcher = ethUSDFetcher(provider);
  const { data, error } = useSWRImmutable(ethUSDFetcherKey(blockTag), fetcher);
  if (error) {
    return undefined;
  }
  return data;
};
