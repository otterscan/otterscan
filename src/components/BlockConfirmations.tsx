import React from "react";

type BlockConfirmationsProps = {
  confirmations: number;
};

const BlockConfirmations: React.FC<BlockConfirmationsProps> = ({
  confirmations,
}) => (
  <span className="rounded text-xs bg-gray-100 text-gray-500 px-2 py-1">
    {confirmations} Block{" "}
    {confirmations === 1 ? "Confirmation" : "Confirmations"}
  </span>
);

export default React.memo(BlockConfirmations);
