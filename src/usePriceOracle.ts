import { JsonRpcProvider, BlockTag } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import AggregatorV3Interface from "@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json";
import FeedRegistryInterface from "@chainlink/contracts/abi/v0.8/FeedRegistryInterface.json";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { ChecksummedAddress } from "./types";
import { useContext } from "react";
import { RuntimeContext } from "./useRuntime";

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

const FEED_REGISTRY_MAINNET_PROTOTYPE = new Contract(
  FEED_REGISTRY_MAINNET,
  FeedRegistryInterface
);

const feedRegistryFetcher =
  (
    provider: JsonRpcProvider | undefined
  ): Fetcher<FeedRegistryFetcherData, FeedRegistryFetcherKey> =>
  async ([tokenAddress, blockTag]) => {
    if (provider === undefined) {
      return [undefined, undefined];
    }

    // It work works on ethereum mainnet and kovan, see:
    // https://docs.chain.link/docs/feed-registry/
    if (provider!.network.chainId !== 1) {
      throw new Error("FeedRegistry is supported only on mainnet");
    }

    // Let SWR handle error
    const feedRegistry = FEED_REGISTRY_MAINNET_PROTOTYPE.connect(provider);
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

const ETH_USD_FEED_PROTOTYPE = new Contract(AddressZero, AggregatorV3Interface);

const ethUSDFetcher =
  (
    provider: JsonRpcProvider | undefined
  ): Fetcher<any | undefined, ["ethusd", BlockTag | undefined]> =>
  async ([_, blockTag]) => {
    if (provider?.network.chainId !== 1) {
      return undefined;
    }

    const c =
      ETH_USD_FEED_PROTOTYPE.connect(provider).attach("eth-usd.data.eth");
    const priceData = await c.latestRoundData({ blockTag });
    return priceData;
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
  return data !== undefined ? BigNumber.from(data.answer) : undefined;
};

export const useFiatValue = (
  ethAmount: BigNumber,
  blockTag: BlockTag | undefined
) => {
  const { provider } = useContext(RuntimeContext);
  const eth2USDValue = useETHUSDOracle(provider, blockTag);
  const fiatValue =
    !ethAmount.isZero() && eth2USDValue !== undefined
      ? FixedNumber.fromValue(ethAmount.mul(eth2USDValue).div(10 ** 8), 18)
      : undefined;

  return fiatValue;
};

export const useETHUSDRawOracle = (
  provider: JsonRpcProvider | undefined,
  blockTag: BlockTag | undefined
): any | undefined => {
  const fetcher = ethUSDFetcher(provider);
  const { data, error } = useSWRImmutable(ethUSDFetcherKey(blockTag), fetcher);
  if (error) {
    return undefined;
  }
  return data;
};

const fastGasFetcherKey = (blockTag: BlockTag | undefined) => {
  if (blockTag === undefined) {
    return null;
  }
  return ["gasgwei", blockTag];
};

const FAST_GAS_FEED_PROTOTYPE = new Contract(
  AddressZero,
  AggregatorV3Interface
);

const fastGasFetcher =
  (
    provider: JsonRpcProvider | undefined
  ): Fetcher<any | undefined, ["gasgwei", BlockTag | undefined]> =>
  async ([_, blockTag]) => {
    if (provider?.network.chainId !== 1) {
      return undefined;
    }
    const c = FAST_GAS_FEED_PROTOTYPE.connect(provider).attach(
      "fast-gas-gwei.data.eth"
    );
    const priceData = await c.latestRoundData({ blockTag });
    return priceData;
  };

export const useFastGasRawOracle = (
  provider: JsonRpcProvider | undefined,
  blockTag: BlockTag | undefined
): any | undefined => {
  const fetcher = fastGasFetcher(provider);
  const { data, error } = useSWRImmutable(fastGasFetcherKey(blockTag), fetcher);
  if (error) {
    return undefined;
  }
  return data;
};
