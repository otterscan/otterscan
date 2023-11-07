import { AbstractProvider, Contract, ZeroAddress } from "ethers";
import { ChecksummedAddress, TokenMeta } from "../../types";
import { ERCTokenResolver } from "./ERCTokenResolver";
import { IAddressResolver } from "./address-resolver";

const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const UNISWAP_V3_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];

const UNISWAP_V3_PAIR_ABI = [
  "function factory() external view returns (address)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)",
];

const UNISWAP_V3_FACTORY_PROTOTYPE = new Contract(
  UNISWAP_V3_FACTORY,
  UNISWAP_V3_FACTORY_ABI,
);

const UNISWAP_V3_PAIR_PROTOTYPE = new Contract(
  ZeroAddress,
  UNISWAP_V3_PAIR_ABI,
);

export type UniswapV3TokenMeta = {
  address: ChecksummedAddress;
} & TokenMeta;

export type UniswapV3PairMeta = {
  pair: ChecksummedAddress;
  token0: UniswapV3TokenMeta;
  token1: UniswapV3TokenMeta;
  fee: bigint;
};

const ercResolver = new ERCTokenResolver();

export class UniswapV3Resolver implements IAddressResolver<UniswapV3PairMeta> {
  async resolveAddress(
    provider: AbstractProvider,
    address: string,
  ): Promise<UniswapV3PairMeta | undefined> {
    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const poolContract = UNISWAP_V3_PAIR_PROTOTYPE.connect(provider).attach(
      address,
    ) as Contract;
    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const factoryContract = UNISWAP_V3_FACTORY_PROTOTYPE.connect(
      provider,
    ) as Contract;

    try {
      // First, probe the factory() function; if it responds with UniswapV2 factory
      // address, it may be a pair
      const factoryAddress = (await poolContract.factory()) as string;
      if (factoryAddress !== UNISWAP_V3_FACTORY) {
        return undefined;
      }

      // Probe the token0/token1/fee
      const [token0, token1, fee] = await Promise.all([
        poolContract.token0() as Promise<string>,
        poolContract.token1() as Promise<string>,
        poolContract.fee() as Promise<bigint>,
      ]);

      // Probe the factory to ensure it is a legit pair
      const expectedPoolAddress = await factoryContract.getPool(
        token0,
        token1,
        fee,
      );
      if (expectedPoolAddress !== address) {
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
        fee,
      };
    } catch (err) {
      // Ignore on purpose; this indicates the probe failed and the address
      // is not a token
    }
    return undefined;
  }
}
