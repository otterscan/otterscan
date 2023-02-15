import React, { FC, memo, useContext, useMemo } from "react";
import { Log } from "@ethersproject/abstract-provider";
import { Fragment, Interface } from "@ethersproject/abi";
import { Tab } from "@headlessui/react";
import LogIndex from "./log/LogIndex";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";
import ModeTab from "../components/ModeTab";
import DecodedParamsTable from "./decoder/DecodedParamsTable";
import DecodedLogSignature from "./decoder/DecodedLogSignature";
import RawLog from "./log/RawLog";
import TwoColumnPanel from "./log/TwoColumnPanel";
import { useTopic0 } from "../useTopic0";
import { RuntimeContext } from "../useRuntime";
import { useSourcifyMetadata } from "../sourcify/useSourcify";

type LogEntryProps = {
  log: Log;
};

const LogEntry: FC<LogEntryProps> = ({ log }) => {
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
        <LogIndex idx={log.logIndex} />
      </div>
      <div className="w-full space-y-2">
        <TwoColumnPanel leftPanel={<span className="font-bold">Address</span>}>
          <TransactionAddressWithCopy address={log.address} />
        </TwoColumnPanel>
        <Tab.Group>
          <Tab.List as={React.Fragment}>
            <TwoColumnPanel leftPanel="Parameters">
              <div className="mb-1 flex space-x-1">
                <ModeTab>Decoded</ModeTab>
                <ModeTab>Raw</ModeTab>
              </div>
            </TwoColumnPanel>
          </Tab.List>
          <Tab.Panels as={React.Fragment}>
            <Tab.Panel>
              {resolvedLogDesc === undefined ? (
                <TwoColumnPanel>Waiting for data...</TwoColumnPanel>
              ) : resolvedLogDesc === null ? (
                <TwoColumnPanel>Can't decode data</TwoColumnPanel>
              ) : (
                <TwoColumnPanel>
                  <DecodedLogSignature event={resolvedLogDesc.eventFragment} />
                  <DecodedParamsTable
                    args={resolvedLogDesc.args}
                    paramTypes={resolvedLogDesc.eventFragment.inputs}
                    hasParamNames={resolvedLogDesc === logDesc}
                  />
                </TwoColumnPanel>
              )}
            </Tab.Panel>
            <Tab.Panel as={React.Fragment}>
              <RawLog topics={log.topics} data={log.data} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default memo(LogEntry);
