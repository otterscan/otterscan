import React from "react";
import ContentFrame from "../ContentFrame";
import AddressLink from "../components/AddressLink";
import { TransactionData } from "../types";

type LogsProps = {
  txData: TransactionData;
};

const Logs: React.FC<LogsProps> = ({ txData }) => (
  <ContentFrame tabs>
    <div className="text-sm py-4">Transaction Receipt Event Logs</div>
    {txData &&
      txData.logs.map((l, i) => (
        <div className="flex space-x-10 py-5" key={i}>
          <div>
            <span className="rounded-full w-12 h-12 flex items-center justify-center bg-green-50 text-green-500">
              {l.logIndex}
            </span>
          </div>
          <div className="w-full space-y-2">
            <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
              <div className="font-bold text-right">Address</div>
              <div className="col-span-11">
                <AddressLink address={l.address} />
              </div>
            </div>
            {l.topics.map((t, i) => (
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
                  className="w-full h-20 bg-gray-50 font-mono focus:outline-none border rounded p-2"
                  value={l.data}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
  </ContentFrame>
);

export default React.memo(Logs);
