import React, { useContext, useMemo } from "react";
import ContentFrame from "../ContentFrame";
import TransactionAddress from "../components/TransactionAddress";
import TraceItem from "./TraceItem";
import { TransactionData } from "../types";
import { useBatch4Bytes } from "../use4Bytes";
import { useTraceTransaction, useUniqueSignatures } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import { ResolvedAddresses } from "../api/address-resolver";
import { tracesCollector, useResolvedAddresses } from "../useResolvedAddresses";

type TraceProps = {
  txData: TransactionData;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const Trace: React.FC<TraceProps> = ({ txData, resolvedAddresses }) => {
  const { provider } = useContext(RuntimeContext);
  const traces = useTraceTransaction(provider, txData.transactionHash);
  const uniqueSignatures = useUniqueSignatures(traces);
  const sigMap = useBatch4Bytes(uniqueSignatures);

  const addrCollector = useMemo(() => tracesCollector(traces), [traces]);
  const traceResolvedAddresses = useResolvedAddresses(provider, addrCollector);
  const mergedResolvedAddresses = useMemo(() => {
    const merge = {};
    if (resolvedAddresses) {
      Object.assign(merge, resolvedAddresses);
    }
    if (traceResolvedAddresses) {
      Object.assign(merge, traceResolvedAddresses);
    }
    return merge;
  }, [resolvedAddresses, traceResolvedAddresses]);

  return (
    <ContentFrame tabs>
      <div className="mt-4 mb-5 space-y-3 font-code text-sm flex flex-col items-start overflow-x-auto">
        <div className="border hover:border-gray-500 rounded px-1 py-0.5">
          <TransactionAddress
            address={txData.from}
            resolvedAddresses={resolvedAddresses}
          />
        </div>
        <div className="ml-5 space-y-3">
          {traces?.map((t, i, a) => (
            <TraceItem
              key={i}
              t={t}
              txData={txData}
              last={i === a.length - 1}
              fourBytesMap={sigMap}
              resolvedAddresses={mergedResolvedAddresses}
            />
          ))}
        </div>
      </div>
    </ContentFrame>
  );
};

export default React.memo(Trace);
