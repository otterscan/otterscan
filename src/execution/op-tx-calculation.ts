export function isOptimisticChain(chainId: bigint | undefined): boolean {
  if (chainId === undefined) {
    return false;
  }
  return chainId === 10n || chainId === 11155420n;
}

export function getOpFeeData(
  txType: number,
  gasPrice: bigint,
  gasUsed: bigint,
  l1Fee: bigint,
): { fee: bigint; gasPrice: bigint } {
  if (txType === 0x7e) {
    return { gasPrice: 0n, fee: 0n };
  }
  return {
    gasPrice,
    fee: gasUsed * gasPrice + l1Fee,
  };
}
