import React from "react";
import ExternalLink from "./ExternalLink";

type TransactionTypeProps = {
  type: number;
};

const TransactionType: React.FC<TransactionTypeProps> = ({ type }) => {
  let description: React.ReactNode;
  switch (type) {
    case 0:
      description = "legacy";
      break;
    case 1:
      description = (
        <ExternalLink href="https://eips.ethereum.org/EIPS/eip-2930">
          EIP-2930
        </ExternalLink>
      );
      break;
    case 2:
      description = (
        <ExternalLink href="https://eips.ethereum.org/EIPS/eip-1559">
          EIP-1559
        </ExternalLink>
      );
      break;
    case 3:
      description = (
        <ExternalLink href="https://eips.ethereum.org/EIPS/eip-4844">
          EIP-4844 (Blob)
        </ExternalLink>
      );
      break;
    case 126:
      description = (
        <ExternalLink href="https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md#the-deposited-transaction-type">
          Optimism: Deposit
        </ExternalLink>
      );
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
