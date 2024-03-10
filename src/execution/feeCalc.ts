import { TransactionData } from "../types";
import { multiplyByScalar } from "./op-tx-calculation";

const feeTypes = ["blob", "burned", "tip", "opL1Fee"];
type FeeType = (typeof feeTypes)[number];
export function calculateFee(
  txData: TransactionData,
  block: { baseFeePerGas: bigint | null } | null | undefined,
): { totalFees: bigint; feeDist: Record<FeeType, bigint> } {
  // Require receipt
  if (!txData.confirmedData || !block) {
    return {
      totalFees: 0n,
      feeDist: feeTypes.reduce(
        (obj: Partial<Record<FeeType, bigint>>, newType: FeeType) => {
          obj[newType] = 0n;
          return obj;
        },
        {} as Partial<Record<FeeType, bigint>>,
      ) as Record<FeeType, bigint>,
    };
  }
  const blobFee =
    txData.confirmedData!.blobGasUsed && txData.confirmedData!.blobGasUsed
      ? txData.confirmedData!.blobGasUsed! * txData.confirmedData!.blobGasPrice!
      : 0n;
  const paidFees = txData.gasPrice! * txData.confirmedData!.gasUsed;
  const burntFees = block
    ? block.baseFeePerGas! * txData.confirmedData!.gasUsed
    : 0n;
  let opL1Fee = 0n;
  if (
    txData.confirmedData &&
    txData.confirmedData.l1GasUsed &&
    txData.confirmedData.l1GasPrice &&
    txData.confirmedData.l1FeeScalar !== undefined
  ) {
    opL1Fee = multiplyByScalar(
      txData.confirmedData.l1GasUsed * txData.confirmedData.l1GasPrice,
      txData.confirmedData.l1FeeScalar,
    );
  }

  const fees: Record<FeeType, bigint> = {
    blob: blobFee,
    burned: burntFees,
    tip: paidFees - burntFees,
    opL1Fee,
  };
  const totalFees = Object.values(fees).reduce((a, b) => a + b, 0n);

  return {
    totalFees,
    feeDist: fees,
  };
}

export function getFeePercents(
  feeDist: Record<FeeType, bigint>,
): Record<FeeType, number> {
  const totalFees = Object.values(feeDist).reduce((a, b) => a + b, 0n);
  if (totalFees === 0n) {
    return feeTypes.reduce(
      (obj: Partial<Record<FeeType, number>>, newType: FeeType) => {
        obj[newType] = 0;
        return obj;
      },
      {} as Partial<Record<FeeType, number>>,
    ) as Record<FeeType, number>;
  }
  const feePerc: { [K in FeeType]: number } = Object.keys(feeDist).reduce(
    (acc, key) => ({
      ...acc,
      [key]: Number((feeDist[key] * 10000n) / totalFees) / 100,
    }),
    {} as Partial<{ [K in FeeType]: number }>,
  ) as { [K in FeeType]: number };
  return feePerc;
}
