import React from "react";
import { InternalOperation, OperationType, TransactionData } from "../types";
import InternalCreate from "./InternalCreate";
import InternalSelfDestruct from "./InternalSelfDestruct";
import InternalTransfer from "./InternalTransfer";

type InternalTransactionOperationProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
};

const InternalTransactionOperation: React.FC<
  InternalTransactionOperationProps
> = ({ txData, internalOp }) => (
  <>
    {internalOp.type === OperationType.TRANSFER && (
      <InternalTransfer txData={txData} internalOp={internalOp} />
    )}
    {internalOp.type === OperationType.SELF_DESTRUCT && (
      <InternalSelfDestruct txData={txData} internalOp={internalOp} />
    )}
    {(internalOp.type === OperationType.CREATE ||
      internalOp.type === OperationType.CREATE2) && (
      <InternalCreate internalOp={internalOp} />
    )}
  </>
);

export default React.memo(InternalTransactionOperation);
