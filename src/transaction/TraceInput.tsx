import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBomb } from "@fortawesome/free-solid-svg-icons";
import TransactionAddress from "../components/TransactionAddress";
import FormattedBalance from "../components/FormattedBalance";
import FunctionSignature from "./FunctionSignature";
import InputDecoder from "./decoder/InputDecoder";
import ExpanderSwitch from "../components/ExpanderSwitch";
import { TraceEntry } from "../useErigonHooks";
import {
  extract4Bytes,
  use4Bytes,
  useTransactionDescription,
} from "../use4Bytes";
import { useChainInfo } from "../useChainInfo";

type TraceInputProps = {
  t: TraceEntry;
};

const TraceInput: React.FC<TraceInputProps> = ({ t }) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const raw4Bytes = extract4Bytes(t.input);
  const fourBytes = use4Bytes(raw4Bytes);
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
    <div
      className={`ml-5 rounded border px-1 py-0.5 hover:border-gray-500 ${
        expanded ? "w-full" : ""
      }`}
    >
      <div className="flex items-baseline">
        <span className="text-xs lowercase text-gray-400">{t.type}</span>
        {t.type === "SELFDESTRUCT" ? (
          <span className="pl-2 text-red-800" title="Self destruct">
            <FontAwesomeIcon icon={faBomb} size="1x" />
          </span>
        ) : (
          <>
            <span>
              <TransactionAddress address={t.to} showCodeIndicator />
            </span>
            {t.type !== "CREATE" && t.type !== "CREATE2" && (
              <>
                <span>.</span>
                <FunctionSignature callType={t.type} sig={sigText} />
                {t.value && !t.value.isZero() && (
                  <span className="whitespace-nowrap text-red-700">
                    {"{"}value: <FormattedBalance value={t.value} /> {symbol}
                    {"}"}
                  </span>
                )}
                <span className="whitespace-nowrap">
                  (
                  {hasParams && (
                    <ExpanderSwitch
                      expanded={expanded}
                      setExpanded={setExpanded}
                    />
                  )}
                  {(!hasParams || !expanded) && <>)</>}
                </span>
              </>
            )}
          </>
        )}
      </div>
      {hasParams && expanded && (
        <>
          <div className="my-2 ml-5 mr-1">
            <InputDecoder
              fourBytes={raw4Bytes ?? "0x"}
              resolvedTxDesc={fourBytesTxDesc}
              hasParamNames={false}
              data={t.input}
              userMethod={undefined}
              devMethod={undefined}
            />
          </div>
          <div>)</div>
        </>
      )}
    </div>
  );
};

export default TraceInput;
