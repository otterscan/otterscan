import React, { useContext } from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import ContentFrame from "../ContentFrame";
import { TransactionData } from "../types";
import { useTraceTransaction } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import TraceItem from "./TraceItem";

type TraceProps = {
  txData: TransactionData;
};

const Trace: React.FC<TraceProps> = ({ txData }) => {
  const { provider } = useContext(RuntimeContext);
  const traces = useTraceTransaction(provider, txData.transactionHash);

  return (
    <ContentFrame tabs>
      <div className="mt-4 mb-5 space-y-3 font-code text-sm flex flex-col items-start">
        <div>
          <AddressHighlighter address={txData.from}>
            <DecoratedAddressLink
              address={txData.from}
              miner={txData.from === txData.confirmedData?.miner}
              txFrom
              txTo={txData.from === txData.to}
            />
          </AddressHighlighter>
        </div>
        {traces?.map((t, i, a) => (
          <TraceItem key={i} t={t} txData={txData} last={i === a.length - 1} />
        ))}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Trace);
