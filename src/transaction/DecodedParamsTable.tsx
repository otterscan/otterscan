import React from "react";
import { ParamType, Result } from "@ethersproject/abi";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import Copy from "../components/Copy";
import { TransactionData } from "../types";

type DecodedParamsTableProps = {
  args: Result;
  paramTypes: ParamType[];
  txData: TransactionData;
};

const DecodedParamsTable: React.FC<DecodedParamsTableProps> = ({
  args,
  paramTypes,
  txData,
}) => (
  <table className="border rounded w-full">
    <thead>
      <tr className="grid grid-cols-12 text-left gap-x-2 py-2 bg-gray-100">
        <th className="col-span-3 pl-1">
          name <span className="text-gray-400 text-xs">(index)</span>
        </th>
        <th className="col-span-1">type</th>
        <th className="col-span-8 pr-1">value</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {args.map((r, i) => (
        <tr key={i} className="grid grid-cols-12 gap-x-2 py-2">
          <td className="col-span-3 pl-1">
            {paramTypes[i].name}{" "}
            <span className="text-gray-400 text-xs">({i})</span>
          </td>
          <td className="col-span-1">{paramTypes[i].type}</td>
          <td className="col-span-8 pr-1 font-code break-all">
            {paramTypes[i].type === "address" ? (
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
            ) : paramTypes[i].type === "bool" ? (
              <span className={`${r ? "text-green-700" : "text-red-700"}`}>
                {r.toString()}
              </span>
            ) : paramTypes[i].type === "bytes" ? (
              <span>
                {r.toString()}{" "}
                <span className="font-sans text-xs text-gray-400">
                  {r.toString().length / 2 - 1}{" "}
                  {r.toString().length / 2 - 1 === 1 ? "byte" : "bytes"}
                </span>
              </span>
            ) : (
              r.toString()
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default React.memo(DecodedParamsTable);
