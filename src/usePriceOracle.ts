import {
  BlockTag,
  Contract,
  FixedNumber,
  JsonRpcApiProvider,
  ZeroAddress,
} from "ethers";
import { useContext } from "react";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import AggregatorV3Interface from "./abi/chainlink/AggregatorV3Interface.json";
import FeedRegistryInterface from "./abi/chainlink/FeedRegistryInterface.json";
import { ChecksummedAddress } from "./types";
import { RuntimeContext } from "./useRuntime";
import { commify } from "./utils/utils";

const FEED_REGISTRY_MAINNET: ChecksummedAddress =
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";

// The USD "token" address for Chainlink feed registry's purposes
const USD = "0x0000000000000000000000000000000000000348";

type FeedRegistryFetcherKey = [ChecksummedAddress, BlockTag];
type FeedRegistryFetcherData = [bigint | undefined, number | undefined];

const feedRegistryFetcherKey = (
  tokenAddress: ChecksummedAddress,
  blockTag: BlockTag | undefined,
): FeedRegistryFetcherKey | null => {
  if (blockTag === undefined) {
    return null;
  }
  return [tokenAddress, blockTag];
};

const FEED_REGISTRY_MAINNET_PROTOTYPE = new Contract(
  FEED_REGISTRY_MAINNET,
  FeedRegistryInterface,
);

const feedRegistryFetcher =
  (
    provider: JsonRpcApiProvider | undefined,
  ): Fetcher<FeedRegistryFetcherData, FeedRegistryFetcherKey> =>
  async ([tokenAddress, blockTag]) => {
    if (provider === undefined) {
      return [undefined, undefined];
    }

    // It work works on ethereum mainnet and kovan, see:
    // https://docs.chain.link/docs/feed-registry/
    if (provider!._network.chainId !== 1n) {
      throw new Error("FeedRegistry is supported only on mainnet");
    }

    // Let SWR handle error
    // TODO: using "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const feedRegistry = FEED_REGISTRY_MAINNET_PROTOTYPE.connect(
      provider,
    ) as Contract;
    const priceData = await feedRegistry.latestRoundData(tokenAddress, USD, {
      blockTag,
    });
    const quote = BigInt(priceData.answer);
    const decimals = await feedRegistry.decimals(tokenAddress, USD, {
      blockTag,
    });
    return [quote, decimals];
  };

export const useTokenUSDOracle = (
  provider: JsonRpcApiProvider | undefined,
  blockTag: BlockTag | undefined,
  tokenAddress: ChecksummedAddress,
): [bigint | undefined, number | undefined] => {
  const fetcher = feedRegistryFetcher(provider);
  const { data, error } = useSWRImmutable(
    feedRegistryFetcherKey(tokenAddress, blockTag),
    fetcher,
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

const ETH_USD_FEED_PROTOTYPE = new Contract(ZeroAddress, AggregatorV3Interface);

const ethUSDFetcher =
  (
    provider: JsonRpcApiProvider | undefined,
  ): Fetcher<any | undefined, ["ethusd", BlockTag | undefined]> =>
  async ([_, blockTag]) => {
    if (provider?._network.chainId !== 1n) {
      return undefined;
    }

    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const c = ETH_USD_FEED_PROTOTYPE.connect(provider).attach(
      "eth-usd.data.eth",
    ) as Contract;
    const priceData = await c.latestRoundData({ blockTag });
    return priceData;
  };

export const useETHUSDOracle = (
  provider: JsonRpcApiProvider | undefined,
  blockTag: BlockTag | undefined,
): bigint | undefined => {
  const fetcher = ethUSDFetcher(provider);
  const { data, error } = useSWRImmutable(ethUSDFetcherKey(blockTag), fetcher);
  if (error) {
    return undefined;
  }
  return data !== undefined ? BigInt(data.answer) : undefined;
};

/**
 * Converts a certain amount of ETH to fiat using an oracle
 */
export const useFiatValue = (
  ethAmount: bigint,
  blockTag: BlockTag | undefined,
) => {
  const { provider } = useContext(RuntimeContext);
  const eth2USDValue = useETHUSDOracle(provider, blockTag);

  if (ethAmount === 0n || eth2USDValue === undefined) {
    return undefined;
  }

  return FixedNumber.fromValue((ethAmount * eth2USDValue) / 10n ** 8n, 18);
};

export const formatFiatValue = (
  fiat: FixedNumber | undefined,
  decimals = 2,
): string | undefined => {
  if (!fiat) {
    return undefined;
  }

  let value = commify(fiat.round(decimals).toString());

  // little hack: commify removes trailing decimal zeros
  const parts = value.split(".");
  if (parts.length == 2) {
    value = value + "0".repeat(decimals - parts[1].length);
  }

  return value;
};

export const useETHUSDRawOracle = (
  provider: JsonRpcApiProvider | undefined,
  blockTag: BlockTag | undefined,
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
  ZeroAddress,
  AggregatorV3Interface,
);

const fastGasFetcher =
  (
    provider: JsonRpcApiProvider | undefined,
  ): Fetcher<any | undefined, ["gasgwei", BlockTag | undefined]> =>
  async ([_, blockTag]) => {
    if (provider?._network.chainId !== 1n) {
      return undefined;
    }
    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const c = FAST_GAS_FEED_PROTOTYPE.connect(provider).attach(
      "fast-gas-gwei.data.eth",
    ) as Contract;
    const priceData = await c.latestRoundData({ blockTag });
    return priceData;
  };

export const useFastGasRawOracle = (
  provider: JsonRpcApiProvider | undefined,
  blockTag: BlockTag | undefined,
): any | undefined => {
  const fetcher = fastGasFetcher(provider);
  const { data, error } = useSWRImmutable(fastGasFetcherKey(blockTag), fetcher);
  if (error) {
    return undefined;
  }
  return data;
};
