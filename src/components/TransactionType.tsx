import React from "react";

type TransactionTypeProps = {
  type: number;
};

const TransactionType: React.FC<TransactionTypeProps> = ({ type }) => {
  let description: string;
  switch (type) {
    case 0:
      description = "legacy";
      break;
    case 1:
      description = "EIP-2930";
      break;
    case 2:
      description = "EIP-1559";
      break;
    default:
      description = "unknown";
  }

  return (
    <span>
      {type} <span className="font-bold">({description})</span>
    </span>
  );
};

export default React.memo(TransactionType);
