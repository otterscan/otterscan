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
import UniswapV2PriceResolver from "./api/token-price-resolver/resolvers/UniswapV2PriceResolver";
import UniswapV3PriceResolver from "./api/token-price-resolver/resolvers/UniswapV3PriceResolver";
import {
  PriceOracleSource,
  TokenPriceResolver,
} from "./api/token-price-resolver/token-price-resolver";
import { ChecksummedAddress } from "./types";
import { type PriceOracleInfo } from "./useConfig";
import { RuntimeContext } from "./useRuntime";
import { commify } from "./utils/utils";

const FEED_REGISTRY_MAINNET: ChecksummedAddress =
  "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";

// The USD "token" address for Chainlink feed registry's purposes
const USD = "0x0000000000000000000000000000000000000348";

// Map of (network ID => (token address => equivalent value token address))
const tokenEquivMap = new Map<
  bigint | undefined,
  Map<ChecksummedAddress, ChecksummedAddress>
>([
  [
    1n,
    new Map<ChecksummedAddress, ChecksummedAddress>([
      [
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      ],
    ]),
  ],
]);

const defaultPriceOracleInfo: Map<bigint, PriceOracleInfo> = new Map<
  bigint,
  PriceOracleInfo
>([
  [
    1n,
    {
      wrappedEthAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      uniswapV2: {
        factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      },
      uniswapV3: {
        factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      },
    },
  ],
  [
    10n,
    {
      nativeTokenPrice: {
        ethUSDOracleAddress: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
        ethUSDOracleDecimals: 8,
      },
      wrappedEthAddress: "0x4200000000000000000000000000000000000006",
      uniswapV2: {
        factoryAddress: "0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf",
      },
      uniswapV3: {
        factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      },
    },
  ],
]);

type FeedRegistryFetcherKey = [ChecksummedAddress, BlockTag];
type FeedRegistryFetcherData = {
  price: bigint | undefined;
  decimals: bigint | undefined;
  source: PriceOracleSource | undefined;
};

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
    priceOracleInfo: PriceOracleInfo | undefined,
    ethPriceData: { price: bigint | undefined; decimals: bigint },
    tokenDecimals: bigint,
  ): Fetcher<FeedRegistryFetcherData, FeedRegistryFetcherKey> =>
  async ([tokenAddress, blockTag]) => {
    if (provider === undefined) {
      return { price: undefined, decimals: undefined, source: undefined };
    }

    // FeedRegistry is supported only on mainnet, see:
    // https://docs.chain.link/docs/feed-registry/
    if (provider!._network.chainId === 1n) {
      try {
        // Let SWR handle error
        // TODO: using "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
        const feedRegistry = FEED_REGISTRY_MAINNET_PROTOTYPE.connect(
          provider,
        ) as Contract;
        const [priceData, decimals, header] = await Promise.all([
          feedRegistry.latestRoundData(tokenAddress, USD, {
            blockTag,
          }),
          feedRegistry.decimals(tokenAddress, USD, {
            blockTag,
          }),
          provider.getBlock(blockTag),
        ]);
        const quote = BigInt(priceData.answer);

        // If oracle is older than 7 days, assume it's stale
        if (
          header !== null &&
          priceData.updatedAt < header.timestamp - 3600 * 24 * 7
        ) {
          throw new Error("Stale oracle quote");
        }

        return { price: quote, decimals, source: "Chainlink" };
      } catch (e) {}

      if (priceOracleInfo === undefined) {
        priceOracleInfo = defaultPriceOracleInfo.get(1n);
      }
    } else if (priceOracleInfo === undefined) {
      priceOracleInfo = defaultPriceOracleInfo.get(provider!._network.chainId);
    }

    if (
      priceOracleInfo &&
      priceOracleInfo.wrappedEthAddress &&
      ethPriceData.decimals + 18n + (18n - tokenDecimals) >= 0n
    ) {
      // ETH price has not come in yet
      if (ethPriceData.price === undefined) {
        throw new Error("ETH price unknown");
      }
      // Special case for Wrapped ETH
      if (tokenAddress === priceOracleInfo.wrappedEthAddress) {
        return {
          price: ethPriceData.price,
          decimals: ethPriceData.decimals,
          source: "Equivalence",
        };
      }

      const resolvers: TokenPriceResolver[] = [];
      if (priceOracleInfo.uniswapV2) {
        if (!priceOracleInfo.uniswapV2.factoryAddress) {
          console.error(
            "Invalid config: UniswapV2 factory address not defined",
          );
        } else {
          resolvers.push(
            new UniswapV2PriceResolver(
              priceOracleInfo.uniswapV2.factoryAddress,
            ),
          );
        }
      }
      if (priceOracleInfo.uniswapV3) {
        if (!priceOracleInfo.uniswapV3.factoryAddress) {
          console.error(
            "Invalid config: UniswapV3 factory address not defined",
          );
        } else {
          resolvers.push(
            new UniswapV3PriceResolver(
              priceOracleInfo.uniswapV3.factoryAddress,
            ),
          );
        }
      }

      const _priceOracleInfo = priceOracleInfo;
      const results = await Promise.all(
        resolvers.map((resolver) =>
          resolver
            .resolveTokenPrice(
              provider,
              _priceOracleInfo.wrappedEthAddress!,
              tokenAddress,
              blockTag,
            )
            .then((result) => {
              if (result === undefined) {
                return result;
              }
              return { ...result, source: resolver.source };
            }),
        ),
      );
      const mostConfidentPool = results.reduce(
        (acc, cur) =>
          cur !== undefined &&
          (acc === undefined || cur.confidence > acc.confidence)
            ? cur
            : acc,
        undefined,
      );
      if (mostConfidentPool === undefined) {
        return { price: undefined, decimals: undefined, source: undefined };
      }
      return {
        price: mostConfidentPool.price * ethPriceData.price,
        decimals: ethPriceData.decimals + 18n + (18n - tokenDecimals),
        source: mostConfidentPool.source,
      };
    }
    return { price: undefined, decimals: undefined, source: undefined };
  };

export const useTokenUSDOracle = (
  provider: JsonRpcApiProvider | undefined,
  blockTag: BlockTag | undefined,
  tokenAddress: ChecksummedAddress,
  tokenDecimals: bigint | undefined,
): FeedRegistryFetcherData => {
  const netTokenEquivMap = tokenEquivMap.get(provider?._network.chainId);
  if (netTokenEquivMap !== undefined) {
    const tokenEquiv = netTokenEquivMap.get(tokenAddress);
    if (tokenEquiv !== undefined) {
      tokenAddress = tokenEquiv;
    }
  }
  const { price: ethPrice, decimals: ethPriceDecimals } = useETHUSDOracle(
    provider,
    blockTag,
  );
  const { config } = useContext(RuntimeContext);
  const fetcher = feedRegistryFetcher(
    provider,
    config.priceOracleInfo,
    {
      price: ethPrice,
      decimals: ethPriceDecimals,
    },
    tokenDecimals ?? 0n,
  );
  // Conditional data fetching, since token price resolvers depend on the ETH price
  const { data, error } = useSWRImmutable(
    ethPrice !== undefined && tokenDecimals !== undefined
      ? feedRegistryFetcherKey(tokenAddress, blockTag)
      : null,
    fetcher,
  );
  if (error) {
    return { price: undefined, decimals: undefined, source: undefined };
  }
  return data ?? { price: undefined, decimals: undefined, source: undefined };
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
    priceOracleInfo: PriceOracleInfo | undefined,
  ): Fetcher<any | undefined, ["ethusd", BlockTag | undefined]> =>
  async ([_, blockTag]) => {
    if (
      provider === undefined ||
      (provider?._network.chainId !== 1n &&
        priceOracleInfo?.nativeTokenPrice?.ethUSDOracleAddress === undefined)
    ) {
      return undefined;
    }

    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const c = ETH_USD_FEED_PROTOTYPE.connect(provider).attach(
      priceOracleInfo?.nativeTokenPrice?.ethUSDOracleAddress ||
        "eth-usd.data.eth",
    ) as Contract;
    const priceData = await c.latestRoundData({ blockTag });
    return priceData;
  };

export const useETHUSDOracle = (
  provider: JsonRpcApiProvider | undefined,
  blockTag: BlockTag | undefined,
): { price: bigint | undefined; decimals: bigint } => {
  const { config } = useContext(RuntimeContext);
  const priceOracleInfo =
    config.priceOracleInfo ??
    (provider
      ? defaultPriceOracleInfo.get(provider._network.chainId)
      : undefined);
  const fetcher = ethUSDFetcher(provider, priceOracleInfo);
  const { data, error } = useSWRImmutable(ethUSDFetcherKey(blockTag), fetcher);
  const decimals = BigInt(
    priceOracleInfo?.nativeTokenPrice?.ethUSDOracleDecimals ?? 8,
  );
  if (error) {
    return { price: undefined, decimals };
  }
  const price = data !== undefined ? BigInt(data.answer) : undefined;
  return { price, decimals };
};

/**
 * Converts a certain amount of ETH to fiat using an oracle
 */
export const useFiatValue = (
  ethAmount: bigint,
  blockTag: BlockTag | undefined,
) => {
  const { provider } = useContext(RuntimeContext);
  const { price: ethPrice, decimals: ethPriceDecimals } = useETHUSDOracle(
    provider,
    blockTag,
  );

  if (ethAmount === 0n || ethPrice === undefined) {
    return undefined;
  }

  return FixedNumber.fromValue(
    (ethAmount * ethPrice) / 10n ** ethPriceDecimals,
    18,
  );
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
  const { config } = useContext(RuntimeContext);
  const fetcher = ethUSDFetcher(provider, config.priceOracleInfo);
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
