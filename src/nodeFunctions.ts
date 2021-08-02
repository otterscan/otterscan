import { ethers } from "ethers";
import { InternalOperation } from "./types";

export const getInternalOperations = async (
  provider: ethers.providers.JsonRpcProvider,
  txHash: string
) => {
  const rawTransfers = await provider.send("ots_getInternalOperations", [
    txHash,
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
