export function multiplyByScalar(num: bigint, decimalStr: string): bigint {
  const [integerPart, fractionalPart] = decimalStr.split(".");
  const numInteger = BigInt(integerPart);
  if (fractionalPart) {
    const numFraction = BigInt(fractionalPart);
    const divisor = 10n ** BigInt(fractionalPart.length);
    return (num * numInteger * divisor + num * numFraction) / divisor;
  }
  return num * numInteger;
}

export const isOptimistic = (chainId: bigint): boolean => {
  return chainId === 10n || chainId === 11155420n;
};

export function getOpFeeData(
  txType: number,
  gasPrice: bigint,
  gasUsed: bigint,
  l1GasUsed: bigint,
  l1GasPrice: bigint,
  l1FeeScalar: string,
): { fee: bigint; gasPrice: bigint } {
  if (txType === 0x7e) {
    return { gasPrice: 0n, fee: 0n };
  }
  return {
    gasPrice,
    fee:
      gasUsed * gasPrice +
      multiplyByScalar(l1GasUsed * l1GasPrice, l1FeeScalar),
  };
}
