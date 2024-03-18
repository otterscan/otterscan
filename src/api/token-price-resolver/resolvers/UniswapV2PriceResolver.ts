import { AbstractProvider, BlockTag, Contract } from "ethers";
import { TokenPriceResolver } from "../token-price-resolver";

export default class UniswapV2PriceResolver implements TokenPriceResolver {
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
  ): Promise<bigint | undefined> {
    const factoryAbi = [
      "function getPair(address tokenA, address tokenB) view returns (address pair)",
    ];
    const factoryContract = new Contract(
      this.factoryAddress,
      factoryAbi,
      provider,
    );

    let pairAddress;
    try {
      pairAddress = await factoryContract.getPair(
        targetTokenAddress,
        referenceTokenAddress,
      );
    } catch (err) {
      return undefined;
    }

    const abiPair = [
      "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    ];

    const pairContract = new Contract(pairAddress, abiPair, provider);

    let reserves: [bigint, bigint];
    try {
      reserves = await pairContract["getReserves"]({ blockTag });
    } catch (err) {
      return undefined;
    }

    const targetTokenIndex =
      BigInt(targetTokenAddress) < BigInt(referenceTokenAddress) ? 0 : 1;
    if (reserves[1 - targetTokenIndex] < this.minEthInPool) {
      // Not enough liquidity
      return undefined;
    }
    return (
      (10n ** 18n * reserves[1 - targetTokenIndex]) / reserves[targetTokenIndex]
    );
  }
}
