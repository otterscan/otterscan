import React, { useMemo } from "react";
import { Log } from "@ethersproject/abstract-provider";
import { Fragment, Interface, LogDescription } from "@ethersproject/abi";
import { Tab } from "@headlessui/react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import Copy from "../components/Copy";
import ModeTab from "../components/ModeTab";
import DecodedParamsTable from "./decoder/DecodedParamsTable";
import DecodedLogSignature from "./decoder/DecodedLogSignature";
import { toTransactionContext, TransactionData } from "../types";
import { useTopic0 } from "../useTopic0";
import { ResolvedAddresses } from "../api/address-resolver";

type LogEntryProps = {
  txData: TransactionData;
  log: Log;
  logDesc: LogDescription | null | undefined;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const LogEntry: React.FC<LogEntryProps> = ({
  txData,
  log,
  logDesc,
  resolvedAddresses,
}) => {
  const rawTopic0 = log.topics[0];
  const topic0 = useTopic0(rawTopic0);

  const topic0LogDesc = useMemo(() => {
    if (!topic0) {
      return topic0;
    }
    if (!topic0.signatures) {
      return undefined;
    }

    const sigs = topic0.signatures;
    for (const sig of sigs) {
      const logFragment = Fragment.fromString(`event ${sig}`);
      const intf = new Interface([logFragment]);
      try {
        return intf.parseLog(log);
      } catch (err) {
        // Ignore on purpose; try to match other sigs
      }
    }
    return undefined;
  }, [topic0, log]);

  const resolvedLogDesc = logDesc ?? topic0LogDesc;

  return (
    <div className="flex space-x-10 py-5">
      <div>
        <span className="rounded-full w-12 h-12 flex items-center justify-center bg-green-50 text-green-500">
          {log.logIndex}
        </span>
      </div>
      <div className="w-full space-y-2">
        <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
          <div className="font-bold text-right">Address</div>
          <div className="col-span-11 mr-auto">
            <div className="flex items-baseline space-x-2 -ml-1 mr-3">
              <AddressHighlighter address={log.address}>
                <DecoratedAddressLink
                  address={log.address}
                  miner={log.address === txData.confirmedData?.miner}
                  txFrom={log.address === txData.from}
                  txTo={log.address === txData.to}
                  resolvedAddresses={resolvedAddresses}
                />
              </AddressHighlighter>
              <Copy value={log.address} />
            </div>
          </div>
        </div>
        <Tab.Group>
          <Tab.List className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
            <div className="text-right">Parameters</div>
            <div className="col-span-11 flex space-x-1 mb-1">
              <ModeTab>Decoded</ModeTab>
              <ModeTab>Raw</ModeTab>
            </div>
          </Tab.List>
          <Tab.Panels as={React.Fragment}>
            <Tab.Panel className="space-y-2">
              {resolvedLogDesc === undefined ? (
                <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                  <div className="col-start-2 flex space-x-2 items-center col-span-11">
                    Waiting for data...
                  </div>
                </div>
              ) : resolvedLogDesc === null ? (
                <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                  <div className="col-start-2 flex space-x-2 items-center col-span-11">
                    Can't decode data
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                    <div className="col-start-2 flex space-x-2 items-center col-span-11 font-mono">
                      <DecodedLogSignature
                        event={resolvedLogDesc.eventFragment}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                    <div className="col-start-2 flex space-x-2 items-center col-span-11">
                      <DecodedParamsTable
                        args={resolvedLogDesc.args}
                        paramTypes={resolvedLogDesc.eventFragment.inputs}
                        txContext={toTransactionContext(txData)}
                        hasParamNames={resolvedLogDesc === logDesc}
                        resolvedAddresses={resolvedAddresses}
                      />
                    </div>
                  </div>
                </>
              )}
            </Tab.Panel>
            <Tab.Panel className="space-y-2">
              {log.topics.map((t, i) => (
                <div
                  className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm"
                  key={i}
                >
                  <div className="text-right">{i === 0 && "Topics"}</div>
                  <div className="flex space-x-2 items-center col-span-11 font-mono">
                    <span className="rounded bg-gray-100 text-gray-500 px-2 py-1 text-xs">
                      {i}
                    </span>
                    <span>{t}</span>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                <div className="text-right pt-2">Data</div>
                <div className="col-span-11">
                  <textarea
                    className="w-full h-40 bg-gray-50 font-mono focus:outline-none border rounded p-2"
                    value={log.data}
                    readOnly
                  />
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default React.memo(LogEntry);
