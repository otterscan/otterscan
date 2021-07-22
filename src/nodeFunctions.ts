import { ethers } from "ethers";
import { TransactionData, InternalOperation } from "./types";

export const getInternalOperations = async (
  provider: ethers.providers.JsonRpcProvider,
  txData: TransactionData
) => {
  const rawTransfers = await provider.send("ots_getInternalOperations", [
    txData.transactionHash,
  ]);

  const _transfers: InternalOperation[] = [];
  for (const t of rawTransfers) {
    _transfers.push({
      type: t.type,
      from: ethers.utils.getAddress(t.from),
      to: ethers.utils.getAddress(t.to),
      value: t.value,
    });
  }
  return _transfers;
};
