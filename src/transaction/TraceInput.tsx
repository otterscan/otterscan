import React from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import FormattedBalance from "../components/FormattedBalance";
import FunctionSignature from "./FunctionSignature";
import { TraceEntry } from "../useErigonHooks";
import { TransactionData } from "../types";
import { ResolvedAddresses } from "../api/address-resolver";
import { extract4Bytes, FourBytesEntry } from "../use4Bytes";

type TraceInputProps = {
  t: TraceEntry;
  txData: TransactionData;
  fourBytesMap: Record<string, FourBytesEntry | null | undefined>;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const TraceInput: React.FC<TraceInputProps> = ({
  t,
  txData,
  fourBytesMap,
  resolvedAddresses,
}) => {
  const raw4Bytes = extract4Bytes(t.input);
  const sigText =
    raw4Bytes === null
      ? "<fallback>"
      : fourBytesMap[raw4Bytes]?.name ?? raw4Bytes;

  return (
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
  );
};

export default TraceInput;
