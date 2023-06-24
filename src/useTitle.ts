import { useEffect } from "react";
import { commify } from "@ethersproject/units";

export const useBlockPageTitle = (blockNumberOrHash: number) => {
  useEffect(() => {
    document.title = `Block #${commify(blockNumberOrHash)} | Otterscan`;
  }, [blockNumberOrHash]);
};

export const useBlockTransactionsPageTitle = (blockNumber: number) => {
  useEffect(() => {
    if (blockNumber !== undefined) {
      document.title = `Block #${blockNumber} Txns | Otterscan`;
    }
  }, [blockNumber]);
};
