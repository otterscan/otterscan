import { FC, memo } from "react";
import { commify } from "../utils/utils";

type BlockConfirmationsProps = {
  confirmations: number;
};

const BlockConfirmations: FC<BlockConfirmationsProps> = ({ confirmations }) => (
  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 whitespace-nowrap">
    {commify(confirmations)} Block{" "}
    {confirmations === 1 ? "Confirmation" : "Confirmations"}
  </span>
);

export default memo(BlockConfirmations);
