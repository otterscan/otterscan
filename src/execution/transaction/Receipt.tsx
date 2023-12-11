import { FC, memo, lazy, Suspense, useContext } from "react";
import ContentFrame from "../../components/ContentFrame";
import StandardTextarea from "../../components/StandardTextarea";
import { TransactionData } from "../../types";
import { RuntimeContext } from "../../useRuntime";
import { useGetRawReceipt } from "../../useErigonHooks";

type ReceiptProps = {
  txData: TransactionData;
};

const Receipt: FC<ReceiptProps> = ({ txData }) => {
  let txHash = txData.transactionHash;
  const {provider} = useContext(RuntimeContext);
  const rawReceipt = useGetRawReceipt(provider, txHash);
  const receiptString = JSON.stringify(rawReceipt, null, 2);

  return (<ContentFrame tabs>
    <div>
    <pre>
    {receiptString}
          </pre>
    </div>
    </ContentFrame> );
};

export default memo(Receipt);
