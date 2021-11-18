import React from "react";
import InternalTransfer from "./InternalTransfer";
import InternalSelfDestruct from "./InternalSelfDestruct";
import InternalCreate from "./InternalCreate";
import { TransactionData, InternalOperation, OperationType } from "../types";
import { ResolvedAddresses } from "../api/address-resolver";

type InternalTransactionOperationProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const InternalTransactionOperation: React.FC<InternalTransactionOperationProps> =
  ({ txData, internalOp, resolvedAddresses }) => (
    <>
      {internalOp.type === OperationType.TRANSFER && (
        <InternalTransfer
          txData={txData}
          internalOp={internalOp}
          resolvedAddresses={resolvedAddresses}
        />
      )}
      {internalOp.type === OperationType.SELF_DESTRUCT && (
        <InternalSelfDestruct
          txData={txData}
          internalOp={internalOp}
          resolvedAddresses={resolvedAddresses}
        />
      )}
      {(internalOp.type === OperationType.CREATE ||
        internalOp.type === OperationType.CREATE2) && (
        <InternalCreate
          txData={txData}
          internalOp={internalOp}
          resolvedAddresses={resolvedAddresses}
        />
      )}
    </>
  );

export default React.memo(InternalTransactionOperation);
