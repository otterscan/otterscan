import { AbstractProvider, BlockTag } from "ethers";

export type PriceOracleSource = "Chainlink" | "Uniswap" | "Equivalence";

export abstract class TokenPriceResolver {
  /**
   * Fetches the current token price in the reference token per 1e18 of the target token
   * @param provider - The provider to the make calls
   * @param referenceTokenAddress - Token address of the reference token, e.g. WETH
   * @param targetTokenAddress - Token address for which we want to fetch price data
   * @returns A promise resolving into an object containing price, a bigint representing
     the reference token value of 1e18 units of the target token, and confidence, a
     measure of the estimated amount of pair liquidity in the pool to back the price.
     If no such price can be calculated, promise instead resolves to undefined.
   */
  abstract resolveTokenPrice(
    provider: AbstractProvider,
    referenceTokenAddress: string,
    targetTokenAddress: string,
    blockTag?: BlockTag,
  ): Promise<{ price: bigint; confidence: bigint } | undefined>;

  // Indicates where the price data came from
  public abstract readonly source: PriceOracleSource;
}
