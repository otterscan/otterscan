import { AbstractProvider, BlockTag } from "ethers";

export abstract class TokenPriceResolver {
  /**
   * Fetches the current token price in the reference token per 1e18 of the target token
   * @param provider - The provider to the make calls
   * @param referenceTokenAddress - Token address of the reference token, e.g. WETH
   * @param targetTokenAddress - Token address for which we want to fetch price data
   * @returns A promise resolving into a bigint representing the reference token value of 1e18 units of the target token,
     or undefined if no such price can be calculated.
   */
  abstract resolveTokenPrice(
    provider: AbstractProvider,
    referenceTokenAddress: string,
    targetTokenAddress: string,
    blockTag?: BlockTag,
  ): Promise<bigint | undefined>;
}
