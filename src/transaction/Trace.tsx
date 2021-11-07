import React, { useContext, useMemo } from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import ContentFrame from "../ContentFrame";
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
          <AddressHighlighter address={txData.from}>
            <DecoratedAddressLink
              address={txData.from}
              miner={txData.from === txData.confirmedData?.miner}
              txFrom
              txTo={txData.from === txData.to}
              resolvedAddresses={mergedResolvedAddresses}
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
                resolvedAddresses={mergedResolvedAddresses}
              />
            ))}
          </div>
        </div>
      </div>
    </ContentFrame>
  );
};

export default React.memo(Trace);
