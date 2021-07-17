import { ethers } from "ethers";
import { TransactionData, Transfer } from "./types";

export const getTransactionTransfers = async (
  provider: ethers.providers.JsonRpcProvider,
  txData: TransactionData
) => {
  const r = await provider.send("ots_getTransactionTransfers", [
    txData.transactionHash,
  ]);

  const _transfers: Transfer[] = [];
  for (const t of r) {
    _transfers.push({
      from: ethers.utils.getAddress(t.from),
      to: ethers.utils.getAddress(t.to),
      value: t.value,
    });
  }
  return _transfers;
};
