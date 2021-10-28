import React, { useContext, useMemo } from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import ContentFrame from "../ContentFrame";
import { TransactionData } from "../types";
import { rawInputTo4Bytes, useBatch4Bytes } from "../use4Bytes";
import {
  TraceGroup,
  useTraceTransaction,
  useUniqueSignatures,
} from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import TraceItem from "./TraceItem";

type TraceProps = {
  txData: TransactionData;
};

const Trace: React.FC<TraceProps> = ({ txData }) => {
  const { provider } = useContext(RuntimeContext);
  const traces = useTraceTransaction(provider, txData.transactionHash);
  const uniqueSignatures = useUniqueSignatures(traces);
  const sigMap = useBatch4Bytes(uniqueSignatures);

  return (
    <ContentFrame tabs>
      <div className="mt-4 mb-5 space-y-3 font-code text-sm flex flex-col items-start overflow-x-auto">
        <div className="flex items-baseline border rounded px-1 py-px">
          <AddressHighlighter address={txData.from}>
            <DecoratedAddressLink
              address={txData.from}
              miner={txData.from === txData.confirmedData?.miner}
              txFrom
              txTo={txData.from === txData.to}
            />
          </AddressHighlighter>
        </div>
        <div className="flex">
          <div className="w-5"></div>
          <div className="space-y-3">
            {traces?.map((t, i, a) => (
              <TraceItem
                key={i}
                t={t}
                txData={txData}
                last={i === a.length - 1}
                fourBytesMap={sigMap}
              />
            ))}
          </div>
        </div>
      </div>
    </ContentFrame>
  );
};

export default React.memo(Trace);
