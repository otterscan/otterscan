import React from "react";
import { TransactionDescription } from "@ethersproject/abi";

type DecodedInputProps = {
  txDesc: TransactionDescription;
};

const DecodedInput: React.FC<DecodedInputProps> = ({ txDesc }) => (
  <table className="border rounded">
    <thead className="grid grid-cols-12 text-left gap-x-1 py-2 bg-gray-100">
      <th className="col-span-3 pl-1">
        param <span className="text-gray-400 text-xs">(index)</span>
      </th>
      <th className="col-span-1">type</th>
      <th className="col-span-8 pr-1">value</th>
    </thead>
    <tbody className="divide-y">
      {txDesc.args.map((r, i) => (
        <tr key={i} className="grid grid-cols-12 gap-x-1 py-2">
          <td className="col-span-3 pl-1">
            {txDesc.functionFragment.inputs[i].name}{" "}
            <span className="text-gray-400 text-xs">({i})</span>
          </td>
          <td className="col-span-1">
            {txDesc.functionFragment.inputs[i].type}
          </td>
          <td className="col-span-8 pr-1 font-code break-all">{r}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default React.memo(DecodedInput);
