import { faBomb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AbiCoder } from "ethers";
import React, { useContext, useState } from "react";
import ExpanderSwitch from "../../components/ExpanderSwitch";
import FormattedBalance from "../../components/FormattedBalance";
import {
  useSourcifyMetadata,
  useTransactionDescription as useSourcifyTransactionDescription,
} from "../../sourcify/useSourcify";
import {
  extract4Bytes,
  use4Bytes,
  useTransactionDescription,
} from "../../use4Bytes";
import { useChainInfo } from "../../useChainInfo";
import { TraceEntry } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import TransactionAddress from "../components/TransactionAddress";
import FunctionSignature from "./FunctionSignature";
import InputDecoder from "./decoder/InputDecoder";
import OutputDecoder from "./decoder/OutputDecoder";

type TraceInputProps = {
  t: TraceEntry;
};

const TraceInput: React.FC<TraceInputProps> = ({ t }) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const { provider } = useContext(RuntimeContext);
  const raw4Bytes = extract4Bytes(t.input);
  const fourBytes = use4Bytes(raw4Bytes, t.to);
  const sigText =
    raw4Bytes === null ? "<fallback>" : fourBytes?.name ?? raw4Bytes;
  const hasParams = t.input.length > 10;
  const hasSig = t.input.length >= 10;
  const isFallback = t.input.length === 2;
  const hasSmallData = t.input.length > 2 && t.input.length < 10;

  const fourBytesTxDesc = useTransactionDescription(
    fourBytes,
    t.input,
    t.value,
  );

  const match = useSourcifyMetadata(t.to, provider?._network.chainId);
  const metadata = match?.metadata;
  const sourcifyTxDesc = useSourcifyTransactionDescription(metadata, {
    data: t.input,
    value: t.value,
  });
  const userDoc = metadata?.output.userdoc;
  const devDoc = metadata?.output.devdoc;
  // TODO: Consider checking stateVariables too
  const userMethod = sourcifyTxDesc
    ? userDoc?.methods[sourcifyTxDesc.signature]
    : undefined;
  const devMethod = sourcifyTxDesc
    ? devDoc?.methods[sourcifyTxDesc.signature]
    : undefined;
  const txDesc = sourcifyTxDesc ?? fourBytesTxDesc;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [retValExpanded, setRetValExpanded] = useState<boolean>(false);
  const isContractCreation = t.type === "CREATE" || t.type === "CREATE2";

  const hasRetVal = t.output !== undefined && t.output !== "0x";
  const retValExpander = (
    <>
      <span className="whitespace-nowrap px-1">
        <span className="text-gray-500">returns</span>
      </span>
      <span>
        (
        <ExpanderSwitch
          expanded={retValExpanded}
          setExpanded={setRetValExpanded}
        />
        {!retValExpanded && ")"}
      </span>
    </>
  );

  return (
    <div
      className={`ml-5 rounded border px-1 py-0.5 hover:border-gray-500 ${
        expanded || retValExpanded ? "w-full" : ""
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
            <span className="font-sans">
              <TransactionAddress
                address={t.to}
                showCodeIndicator
                creation={isContractCreation || undefined}
              />
            </span>
            {!isContractCreation && (isFallback || hasSig) && (
              <>
                <span>.</span>
                <FunctionSignature callType={t.type} sig={sigText} />
              </>
            )}
            {t.value && t.value !== 0n && (
              <span className="whitespace-nowrap text-red-700">
                {"{"}value: <FormattedBalance value={t.value} symbol={symbol} />
                {"}"}
              </span>
            )}
            <span className="whitespace-nowrap">
              (
              {(hasParams || hasSmallData || isContractCreation) && (
                <ExpanderSwitch expanded={expanded} setExpanded={setExpanded} />
              )}
              {(!(hasParams || hasSmallData || isContractCreation) ||
                !expanded) && <>)</>}
            </span>

            {!expanded && hasRetVal && retValExpander}
          </>
        )}
      </div>
      {(hasParams || hasSmallData || isContractCreation) && expanded && (
        <>
          <div className="my-2 ml-5 mr-1">
            <InputDecoder
              fourBytes={raw4Bytes ?? "0x"}
              resolvedTxDesc={txDesc}
              hasParamNames={txDesc === sourcifyTxDesc}
              data={t.input}
              userMethod={userMethod}
              devMethod={devMethod}
            />
          </div>
          <div className="flex items-baseline">
            ) {hasRetVal && retValExpander}
          </div>
        </>
      )}
      {t.output !== undefined && t.output !== "0x" && retValExpanded && (
        <>
          <div className="my-2 ml-5 mr-1">
            <OutputDecoder
              args={
                txDesc
                  ? AbiCoder.defaultAbiCoder().decode(
                      txDesc.fragment.outputs,
                      t.output,
                    )
                  : undefined
              }
              paramTypes={txDesc?.fragment?.outputs}
              data={t.output}
              devMethod={devMethod}
            />
          </div>
          <div>)</div>
        </>
      )}
    </div>
  );
};

export default TraceInput;
