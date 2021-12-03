import { BaseProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { IAddressResolver } from "./address-resolver";
import { ChecksummedAddress, TokenMeta } from "../../types";
import { ERCTokenResolver } from "./ERCTokenResolver";

const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const UNISWAP_V2_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
];

const UNISWAP_V2_PAIR_ABI = [
  "function factory() external view returns (address)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

export type UniswapV2TokenMeta = {
  address: ChecksummedAddress;
} & TokenMeta;

export type UniswapV2PairMeta = {
  pair: ChecksummedAddress;
  token0: UniswapV2TokenMeta;
  token1: UniswapV2TokenMeta;
};

const ercResolver = new ERCTokenResolver();

export class UniswapV2Resolver implements IAddressResolver<UniswapV2PairMeta> {
  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<UniswapV2PairMeta | undefined> {
    const pairContract = new Contract(address, UNISWAP_V2_PAIR_ABI, provider);
    const factoryContract = new Contract(
      UNISWAP_V2_FACTORY,
      UNISWAP_V2_FACTORY_ABI,
      provider
    );

    try {
      // First, probe the factory() function; if it responds with UniswapV2 factory
      // address, it may be a pair
      const factoryAddress = (await pairContract.factory()) as string;
      if (factoryAddress !== UNISWAP_V2_FACTORY) {
        return undefined;
      }

      // Probe the token0/token1
      const [token0, token1] = await Promise.all([
        pairContract.token0() as string,
        pairContract.token1() as string,
      ]);

      // Probe the factory to ensure it is a legit pair
      const expectedPairAddress = await factoryContract.getPair(token0, token1);
      if (expectedPairAddress !== address) {
        return undefined;
      }

      console.log(`Found pair: ${token0}/${token1}`);
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
}
