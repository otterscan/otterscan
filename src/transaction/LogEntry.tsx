import React, { Fragment } from "react";
import { Log } from "@ethersproject/abstract-provider";
import { LogDescription } from "@ethersproject/abi";
import { Tab } from "@headlessui/react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import Copy from "../components/Copy";
import ModeTab from "../components/ModeTab";
import DecodedParamsTable from "./DecodedParamsTable";
import DecodedLogSignature from "./DecodedLogSignature";
import { TransactionData } from "../types";

type LogEntryProps = {
  txData: TransactionData;
  log: Log;
  logDesc: LogDescription | null | undefined;
};

const LogEntry: React.FC<LogEntryProps> = ({ txData, log, logDesc }) => (
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
              />
            </AddressHighlighter>
            <Copy value={log.address} />
          </div>
        </div>
      </div>
      <Tab.Group>
        <Tab.List className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
          <div className="col-start-2 col-span-11 flex space-x-1 mb-1">
            <ModeTab>Decoded</ModeTab>
            <ModeTab>Raw</ModeTab>
          </div>
        </Tab.List>
        <Tab.Panels as={Fragment}>
          <Tab.Panel className="space-y-2">
            {logDesc && (
              <>
                <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                  <div className="text-right">Signature</div>
                  <div className="flex space-x-2 items-center col-span-11 font-mono">
                    <DecodedLogSignature event={logDesc.eventFragment} />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                  <div className="text-right">Name</div>
                  <div className="flex space-x-2 items-center col-span-11">
                    <DecodedParamsTable
                      args={logDesc.args}
                      paramTypes={logDesc.eventFragment.inputs}
                      txData={txData}
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

export default React.memo(LogEntry);
