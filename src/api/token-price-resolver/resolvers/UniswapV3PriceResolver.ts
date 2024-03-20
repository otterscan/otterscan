import { AbstractProvider, BlockTag, Contract, ZeroAddress } from "ethers";
import erc20 from "../../../abi/erc20.json";
import { TokenPriceResolver } from "../token-price-resolver";

const ERC20_PROTOTYPE = new Contract(ZeroAddress, erc20);

export default class UniswapV3PriceResolver implements TokenPriceResolver {
  factoryAddress: string;
  minEthInPool: bigint;

  constructor(factoryAddress: string, minEthInPool: bigint = 10n ** 17n) {
    this.factoryAddress = factoryAddress;
    this.minEthInPool = minEthInPool;
  }

  async resolveTokenPrice(
    provider: AbstractProvider,
    referenceTokenAddress: string,
    targetTokenAddress: string,
    blockTag: BlockTag = "latest",
  ): Promise<{ price: bigint; confidence: bigint } | undefined> {
    const factoryAbi = [
      "function getPool(address tokenA, address tokenB, uint24 feeTier) view returns (address pair)",
    ];
    const factoryContract = new Contract(
      this.factoryAddress,
      factoryAbi,
      provider,
    );

    let poolAddresses: string[];
    try {
      poolAddresses = await Promise.all(
        [100n, 500n, 3000n, 10000n].map((feeTier) =>
          factoryContract.getPool(
            targetTokenAddress,
            referenceTokenAddress,
            feeTier,
            { blockTag },
          ),
        ),
      );
      poolAddresses = poolAddresses.filter(
        (poolAddress) =>
          poolAddress !== "0x0000000000000000000000000000000000000000",
      );
    } catch (err) {
      return undefined;
    }

    const abiPool = [
      "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    ];

    const poolContracts = poolAddresses.map(
      (poolAddress) => new Contract(poolAddress, abiPool, provider),
    );

    let sqrtPriceX96s: bigint[];
    try {
      sqrtPriceX96s = await Promise.all(
        poolContracts.map((poolContract) => poolContract.slot0({ blockTag })),
      ).then((slot0Values) =>
        slot0Values.map((slot0Value) => slot0Value.sqrtPriceX96),
      );
    } catch (err) {
      return undefined;
    }

    // Use whichever pool has the most reference tokens available, regardless of positions.
    // This approach may include pools with no available liquidity if all positions fall outside
    // the actual token price.
    const referenceToken = ERC20_PROTOTYPE.connect(provider).attach(
      referenceTokenAddress,
    ) as Contract;
    let refTokenLiquidity: bigint[];
    try {
      refTokenLiquidity = await Promise.all(
        poolAddresses.map((poolAddress) =>
          referenceToken.balanceOf(poolAddress),
        ),
      );
    } catch (err) {
      return undefined;
    }

    if (refTokenLiquidity.length === 0) {
      return undefined;
    }

    const findLargestValue = (arr: bigint[]): [number, bigint] =>
      arr.reduce(
        (acc, cur, idx) => (cur > acc[1] ? [idx, cur] : acc),
        [0, -1n],
      );
    const [largestIndex, largestLiquidity]: [number, bigint] =
      findLargestValue(refTokenLiquidity);

    if (largestLiquidity < this.minEthInPool) {
      return undefined;
    }

    const targetTokenIndex =
      BigInt(targetTokenAddress) < BigInt(referenceTokenAddress) ? 0 : 1;
    // sqrtPriceX96 = (x / y)^0.5 / 2^96, so (x / y) = sqrtPriceX96^2 / (2^96)^2
    if (targetTokenIndex === 0) {
      return {
        price:
          (10n ** 18n * sqrtPriceX96s[largestIndex] ** 2n) / 2n ** (96n * 2n),
        confidence: largestLiquidity / 2n,
      };
    } else {
      return {
        price:
          (10n ** 18n * 2n ** (96n * 2n)) / sqrtPriceX96s[largestIndex] ** 2n,
        confidence: largestLiquidity / 2n,
      };
    }
  }
}
