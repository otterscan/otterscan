import React from "react";
import InternalTransfer from "./InternalTransfer";
import InternalSelfDestruct from "./InternalSelfDestruct";
import InternalCreate from "./InternalCreate";
import { TransactionData, Transfer, TransferType } from "../types";

type InternalOperationProps = {
  txData: TransactionData;
  transfer: Transfer;
};

const InternalOperation: React.FC<InternalOperationProps> = ({
  txData,
  transfer,
}) => (
  <>
    {transfer.type === TransferType.TRANSFER && (
      <InternalTransfer txData={txData} transfer={transfer} />
    )}
    {transfer.type === TransferType.SELF_DESTRUCT && (
      <InternalSelfDestruct txData={txData} transfer={transfer} />
    )}
    {(transfer.type === TransferType.CREATE ||
      transfer.type === TransferType.CREATE2) && (
      <InternalCreate txData={txData} transfer={transfer} />
    )}
  </>
);

export default React.memo(InternalOperation);
