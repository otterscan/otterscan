import { useMemo } from "react";
import { getAddress } from "@ethersproject/address";
import { ChecksummedAddress } from "../types";
import t2crtokens from "./t2crtokens.eth.json";

export const useTokenSet = (
  chainId: number | undefined
): Set<ChecksummedAddress> => {
  const res = useMemo(() => {
    const list = t2crtokens.tokens
      .filter((t) => t.chainId === chainId)
      .map((t) => getAddress(t.address));
    return new Set(list);
  }, [chainId]);

  return res;
};
