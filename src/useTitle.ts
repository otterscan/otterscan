import { useEffect } from "react";
import { commify } from "@ethersproject/units";

export const useBlockPageTitle = (blockNumberOrHash: number) => {
  useEffect(() => {
    document.title = `Block #${commify(blockNumberOrHash)} | Otterscan`;
  }, [blockNumberOrHash]);
};
