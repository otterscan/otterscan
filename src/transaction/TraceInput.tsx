import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import TransactionAddress from "../components/TransactionAddress";
import FormattedBalance from "../components/FormattedBalance";
import FunctionSignature from "./FunctionSignature";
import DecodedParamsTable from "./decoder/DecodedParamsTable";
import { TraceEntry } from "../useErigonHooks";
import { ResolvedAddresses } from "../api/address-resolver";
import {
  extract4Bytes,
  FourBytesEntry,
  useTransactionDescription,
} from "../use4Bytes";

type TraceInputProps = {
  t: TraceEntry;
  fourBytesMap: Record<string, FourBytesEntry | null | undefined>;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const TraceInput: React.FC<TraceInputProps> = ({
  t,
  fourBytesMap,
  resolvedAddresses,
}) => {
  const raw4Bytes = extract4Bytes(t.input);
  const fourBytes = raw4Bytes !== null ? fourBytesMap[raw4Bytes] : null;
  const sigText =
    raw4Bytes === null ? "<fallback>" : fourBytes?.name ?? raw4Bytes;
  const hasParams = t.input.length > 10;

  const fourBytesTxDesc = useTransactionDescription(
    fourBytes,
    t.input,
    t.value
  );

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="ml-5 border hover:border-gray-500 rounded px-1 py-0.5">
      <div className="flex items-baseline">
        <span className="text-xs text-gray-400 lowercase">{t.type}</span>
        <span>
          <TransactionAddress
            address={t.to}
            resolvedAddresses={resolvedAddresses}
          />
        </span>
        <span>.</span>
        <FunctionSignature callType={t.type} sig={sigText} />
        {t.value && !t.value.isZero() && (
          <span className="text-red-700 whitespace-nowrap">
            {"{"}value: <FormattedBalance value={t.value} /> ETH{"}"}
          </span>
        )}
        <span className="whitespace-nowrap">
          (
          {hasParams && (
            <Switch
              className="text-xs"
              checked={expanded}
              onChange={setExpanded}
            >
              {expanded ? (
                <span className="text-gray-400">[-]</span>
              ) : (
                <>[...]</>
              )}
            </Switch>
          )}
          {(!hasParams || !expanded) && <>)</>}
        </span>
      </div>
      {hasParams && expanded && fourBytesTxDesc && (
        <>
          <div className="ml-5 mr-1 my-2">
            <DecodedParamsTable
              args={fourBytesTxDesc.args}
              paramTypes={fourBytesTxDesc.functionFragment.inputs}
              hasParamNames={false}
              resolvedAddresses={resolvedAddresses}
            />
          </div>
          <div>)</div>
        </>
      )}
    </div>
  );
};

export default TraceInput;
