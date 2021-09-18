import React from "react";
import { LogDescription } from "@ethersproject/abi";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import Copy from "../components/Copy";
import { TransactionData } from "../types";

type DecodedLogProps = {
  txData: TransactionData;
  logDesc: LogDescription;
};

const DecodedLog: React.FC<DecodedLogProps> = ({ txData, logDesc }) => (
  <table className="border rounded w-full">
    <thead>
      <tr className="grid grid-cols-12 text-left gap-x-2 py-2 bg-gray-100">
        <th className="col-span-3 pl-1">
          param <span className="text-gray-400 text-xs">(index)</span>
        </th>
        <th className="col-span-1">type</th>
        <th className="col-span-8 pr-1">value</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {logDesc.args.map((r, i) => (
        <tr key={i} className="grid grid-cols-12 gap-x-2 py-2">
          <td className="col-span-3 pl-1">
            {logDesc.eventFragment.inputs[i].name}{" "}
            <span className="text-gray-400 text-xs">({i})</span>
          </td>
          <td className="col-span-1">{logDesc.eventFragment.inputs[i].type}</td>
          <td className="col-span-8 pr-1 font-code break-all">
            {logDesc.eventFragment.inputs[i].type === "address" ? (
              <div className="flex items-baseline space-x-2 -ml-1 mr-3">
                <AddressHighlighter address={r.toString()}>
                  <DecoratedAddressLink
                    address={r.toString()}
                    miner={r.toString() === txData.confirmedData?.miner}
                    txFrom={r.toString() === txData.from}
                    txTo={r.toString() === txData.to}
                  />
                </AddressHighlighter>
                <Copy value={r.toString()} />
              </div>
            ) : (
              r.toString()
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default React.memo(DecodedLog);
