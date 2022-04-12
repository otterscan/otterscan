import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import InternalTransfer from "./InternalTransfer";
import InternalSelfDestruct from "./InternalSelfDestruct";
import InternalCreate from "./InternalCreate";
import { TransactionData, InternalOperation, OperationType } from "../types";

type InternalTransactionOperationProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
  // TODO: migrate all this logic to SWR
  ethUSDPrice: BigNumber | undefined;
};

const InternalTransactionOperation: React.FC<
  InternalTransactionOperationProps
> = ({ txData, internalOp, ethUSDPrice }) => (
  <>
    {internalOp.type === OperationType.TRANSFER && (
      <InternalTransfer
        txData={txData}
        internalOp={internalOp}
        ethUSDPrice={ethUSDPrice}
      />
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
