import { JsonRpcProvider } from "@ethersproject/providers";
import { getAddress } from "@ethersproject/address";
import { InternalOperation } from "./types";

export const getInternalOperations = async (
  provider: JsonRpcProvider,
  txHash: string
) => {
  const rawTransfers = await provider.send("ots_getInternalOperations", [
    txHash,
  ]);

  const _transfers: InternalOperation[] = [];
  for (const t of rawTransfers) {
    _transfers.push({
      type: t.type,
      from: getAddress(t.from),
      to: getAddress(t.to),
      value: t.value,
    });
  }
  return _transfers;
};
