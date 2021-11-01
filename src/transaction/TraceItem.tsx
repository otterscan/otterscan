import React from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import FormattedBalance from "../components/FormattedBalance";
import FunctionSignature from "./FunctionSignature";
import { TransactionData } from "../types";
import { extract4Bytes, FourBytesEntry } from "../use4Bytes";
import { TraceGroup } from "../useErigonHooks";
import { ResolvedAddresses } from "../api/address-resolver";

type TraceItemProps = {
  t: TraceGroup;
  txData: TransactionData;
  last: boolean;
  fourBytesMap: Record<string, FourBytesEntry | null | undefined>;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const TraceItem: React.FC<TraceItemProps> = ({
  t,
  txData,
  last,
  fourBytesMap,
  resolvedAddresses,
}) => {
  const raw4Bytes = extract4Bytes(t.input);
  const sigText =
    raw4Bytes === null
      ? "<fallback>"
      : fourBytesMap[raw4Bytes]?.name ?? raw4Bytes;

  return (
    <>
      <div className="flex relative">
        <div className="absolute border-l border-b w-5 h-full transform -translate-y-1/2"></div>
        {!last && (
          <div className="absolute left-0 border-l w-5 h-full transform translate-y-1/2"></div>
        )}
        <div className="ml-5 flex items-baseline border rounded px-1 py-px">
          <span className="text-xs text-gray-400 lowercase">{t.type}</span>
          <span>
            <AddressHighlighter address={t.to}>
              <DecoratedAddressLink
                address={t.to}
                miner={t.to === txData.confirmedData?.miner}
                txFrom={t.to === txData.from}
                txTo={t.to === txData.to}
                resolvedAddresses={resolvedAddresses}
              />
            </AddressHighlighter>
          </span>
          <span>.</span>
          <FunctionSignature callType={t.type} sig={sigText} />
          {t.value && !t.value.isZero() && (
            <span className="text-red-700 whitespace-nowrap">
              {"{"}value: <FormattedBalance value={t.value} /> ETH{"}"}
            </span>
          )}
          <span className="whitespace-nowrap">
            ({t.input.length > 10 && <>input=[0x{t.input.slice(10)}]</>})
          </span>
        </div>
      </div>
      {t.children && (
        <div className={`pl-10 ${last ? "" : "border-l"} space-y-3`}>
          {t.children.map((tc, i, a) => (
            <TraceItem
              key={i}
              t={tc}
              txData={txData}
              last={i === a.length - 1}
              fourBytesMap={fourBytesMap}
              resolvedAddresses={resolvedAddresses}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default TraceItem;
