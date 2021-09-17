import React from "react";
import { LogDescription } from "@ethersproject/abi";

type DecodedLogProps = {
  logDesc: LogDescription;
};

const DecodedLog: React.FC<DecodedLogProps> = ({ logDesc }) => (
  <table className="border rounded">
    <thead>
      <tr className="grid grid-cols-12 text-left gap-x-1 py-2 bg-gray-100">
        <th className="col-span-3 pl-1">
          param <span className="text-gray-400 text-xs">(index)</span>
        </th>
        <th className="col-span-1">type</th>
        <th className="col-span-8 pr-1">value</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {logDesc.args.map((r, i) => (
        <tr key={i} className="grid grid-cols-12 gap-x-1 py-2">
          <td className="col-span-3 pl-1">
            {logDesc.eventFragment.inputs[i].name}{" "}
            <span className="text-gray-400 text-xs">({i})</span>
          </td>
          <td className="col-span-1">{logDesc.eventFragment.inputs[i].type}</td>
          <td className="col-span-8 pr-1 font-code break-all">{r}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default React.memo(DecodedLog);
