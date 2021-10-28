import React from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import FormattedBalance from "../components/FormattedBalance";
import FunctionSignature from "./FunctionSignature";
import { TransactionData } from "../types";
import { FourBytesEntry, rawInputTo4Bytes } from "../use4Bytes";
import { TraceGroup } from "../useErigonHooks";

type TraceItemProps = {
  t: TraceGroup;
  txData: TransactionData;
  last: boolean;
  fourBytesMap: Record<string, FourBytesEntry | null | undefined>;
};

const TraceItem: React.FC<TraceItemProps> = ({
  t,
  txData,
  last,
  fourBytesMap,
}) => {
  const raw4Bytes = rawInputTo4Bytes(t.input);
  const fourBytesEntry = fourBytesMap[raw4Bytes];

  return (
    <>
      <div className="flex">
        <div className="relative w-5">
          <div className="absolute border-l border-b w-full h-full transform -translate-y-1/2"></div>
          {!last && (
            <div className="absolute left-0 border-l w-full h-full transform translate-y-1/2"></div>
          )}
        </div>
        <div className="flex items-baseline border rounded px-1 py-px">
          <span className="text-xs text-gray-400 lowercase">{t.type}</span>
          <span>
            <AddressHighlighter address={t.to}>
              <DecoratedAddressLink
                address={t.to}
                miner={t.to === txData.confirmedData?.miner}
                txFrom={t.to === txData.from}
                txTo={t.to === txData.to}
              />
            </AddressHighlighter>
          </span>
          <span>.</span>
          <FunctionSignature
            callType={t.type}
            sig={fourBytesEntry ? fourBytesEntry.name : raw4Bytes}
          />
          {t.value && !t.value.isZero() && (
            <span className="text-red-700 whitespace-nowrap">
              {"{"}value: <FormattedBalance value={t.value} /> ETH{"}"}
            </span>
          )}
          <span>(</span>
          {t.input.length > 10 && (
            <span className="whitespace-nowrap">
              input=[0x{t.input.slice(10)}]
            </span>
          )}
          <span>)</span>
        </div>
      </div>
      {t.children && (
        <div className="flex">
          <div className={`w-10 ${last ? "" : "border-l"}`}></div>
          <div className="space-y-3">
            {t.children.map((tc, i, a) => (
              <TraceItem
                key={i}
                t={tc}
                txData={txData}
                last={i === a.length - 1}
                fourBytesMap={fourBytesMap}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TraceItem;
