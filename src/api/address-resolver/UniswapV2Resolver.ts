import { AbstractProvider, Contract, ZeroAddress } from "ethers";
import { ChecksummedAddress, TokenMeta } from "../../types";
import { ERCTokenResolver } from "./ERCTokenResolver";
import { AddressResolver } from "./address-resolver";

const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const UNISWAP_V2_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

const UNISWAP_V2_PAIR_ABI = [
  "function factory() external view returns (address)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

const UNISWAP_V2_FACTORY_PROTOTYPE = new Contract(
  UNISWAP_V2_FACTORY,
  UNISWAP_V2_FACTORY_ABI,
);

const UNISWAP_V2_PAIR_PROTOTYPE = new Contract(
  ZeroAddress,
  UNISWAP_V2_PAIR_ABI,
);

export type UniswapV2TokenMeta = {
  address: ChecksummedAddress;
} & TokenMeta;

export type UniswapV2PairMeta = {
  pair: ChecksummedAddress;
  token0: UniswapV2TokenMeta;
  token1: UniswapV2TokenMeta;
};

const ercResolver = new ERCTokenResolver();

export class UniswapV2Resolver extends AddressResolver<UniswapV2PairMeta> {
  async resolveAddress(
    provider: AbstractProvider,
    address: string,
  ): Promise<UniswapV2PairMeta | undefined> {
    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const pairContract = UNISWAP_V2_PAIR_PROTOTYPE.connect(provider).attach(
      address,
    ) as Contract;
    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const factoryContract = UNISWAP_V2_FACTORY_PROTOTYPE.connect(
      provider,
    ) as Contract;

    try {
      // First, probe the factory() function; if it responds with UniswapV2 factory
      // address, it may be a pair
      const factoryAddress = (await pairContract.factory()) as string;
      if (factoryAddress !== UNISWAP_V2_FACTORY) {
        return undefined;
      }

      // Probe the token0/token1
      const [token0, token1] = await Promise.all([
        pairContract.token0() as Promise<string>,
        pairContract.token1() as Promise<string>,
      ]);

      // Probe the factory to ensure it is a legit pair
      const expectedPairAddress = await factoryContract.getPair(token0, token1);
      if (expectedPairAddress !== address) {
        return undefined;
      }

      const [meta0, meta1] = await Promise.all([
        ercResolver.resolveAddress(provider, token0),
        ercResolver.resolveAddress(provider, token1),
      ]);
      if (meta0 === undefined || meta1 === undefined) {
        return undefined;
      }

      return {
        pair: address,
        token0: { address: token0, ...meta0 },
        token1: { address: token1, ...meta1 },
      };
    } catch (err) {
      // Ignore on purpose; this indicates the probe failed and the address
      // is not a token
    }
    return undefined;
  }

  resolveToString(
    resolvedAddress: UniswapV2PairMeta | undefined,
  ): string | undefined {
    if (resolvedAddress === undefined) {
      return undefined;
    }
    return `Uniswap V2 LP: ${resolvedAddress.token0.symbol}/${resolvedAddress.token1.symbol}`;
  }

  trusted(resolvedAddress: UniswapV2PairMeta | undefined): boolean | undefined {
    return true;
  }
}
