import React, { useContext, useMemo } from "react";
import { Log } from "@ethersproject/abstract-provider";
import { Fragment, Interface } from "@ethersproject/abi";
import { Tab } from "@headlessui/react";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";
import ModeTab from "../components/ModeTab";
import DecodedParamsTable from "./decoder/DecodedParamsTable";
import DecodedLogSignature from "./decoder/DecodedLogSignature";
import { useTopic0 } from "../useTopic0";
import { RuntimeContext } from "../useRuntime";
import { useSourcifyMetadata } from "../sourcify/useSourcify";

type LogEntryProps = {
  log: Log;
};

const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const { provider } = useContext(RuntimeContext);
  const match = useSourcifyMetadata(log.address, provider?.network.chainId);

  const logDesc = useMemo(() => {
    if (!match) {
      return match;
    }

    const abi = match.metadata.output.abi;
    const intf = new Interface(abi as any);
    try {
      return intf.parseLog({
        topics: log.topics,
        data: log.data,
      });
    } catch (err) {
      console.warn("Couldn't find function signature", err);
      return null;
    }
  }, [log, match]);

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
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          {log.logIndex}
        </span>
      </div>
      <div className="w-full space-y-2">
        <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
          <div className="text-right font-bold">Address</div>
          <div className="col-span-11 mr-auto">
            <TransactionAddressWithCopy address={log.address} />
          </div>
        </div>
        <Tab.Group>
          <Tab.List className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
            <div className="text-right">Parameters</div>
            <div className="col-span-11 mb-1 flex space-x-1">
              <ModeTab>Decoded</ModeTab>
              <ModeTab>Raw</ModeTab>
            </div>
          </Tab.List>
          <Tab.Panels as={React.Fragment}>
            <Tab.Panel className="space-y-2">
              {resolvedLogDesc === undefined ? (
                <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                  <div className="col-span-11 col-start-2 flex items-center space-x-2">
                    Waiting for data...
                  </div>
                </div>
              ) : resolvedLogDesc === null ? (
                <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                  <div className="col-span-11 col-start-2 flex items-center space-x-2">
                    Can't decode data
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                    <div className="col-span-11 col-start-2 flex items-center space-x-2">
                      <DecodedLogSignature
                        event={resolvedLogDesc.eventFragment}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                    <div className="col-span-11 col-start-2 flex items-center space-x-2">
                      <DecodedParamsTable
                        args={resolvedLogDesc.args}
                        paramTypes={resolvedLogDesc.eventFragment.inputs}
                        hasParamNames={resolvedLogDesc === logDesc}
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
                  <div className="col-span-11 flex items-center space-x-2 font-mono">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                      {i}
                    </span>
                    <span>{t}</span>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                <div className="pt-2 text-right">Data</div>
                <div className="col-span-11">
                  <textarea
                    className="h-40 w-full rounded border bg-gray-50 p-2 font-mono focus:outline-none"
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
