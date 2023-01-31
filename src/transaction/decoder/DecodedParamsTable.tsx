import React from "react";
import { ParamType, Result } from "@ethersproject/abi";
import DecodedParamRow from "./DecodedParamRow";
import { DevMethod, UserMethod } from "../../sourcify/useSourcify";

type DecodedParamsTableProps = {
  args: Result;
  paramTypes: ParamType[];
  hasParamNames?: boolean;
  userMethod?: UserMethod | undefined;
  devMethod?: DevMethod | undefined;
};

const DecodedParamsTable: React.FC<DecodedParamsTableProps> = ({
  args,
  paramTypes,
  hasParamNames = true,
  devMethod,
}) => (
  <table className="w-full border">
    <thead>
      <tr className="grid grid-cols-12 gap-x-2 bg-gray-100 py-2 text-left">
        <th className="col-span-3 pl-1">
          name <span className="text-xs text-gray-400">(index)</span>
        </th>
        <th className="col-span-1">type</th>
        <th className="col-span-8 pr-1">value</th>
      </tr>
      {!hasParamNames && (
        <tr className="grid grid-cols-12 gap-x-2 bg-amber-100 py-2 text-left text-red-700">
          <th className="col-span-12 px-1">
            {paramTypes.length > 0 && paramTypes[0].name !== null
              ? "Parameter names are estimated."
              : "Parameter names are not available."}
          </th>
        </tr>
      )}
    </thead>
    <tbody className="divide-y">
      {args.map((r, i) => (
        <DecodedParamRow
          key={i}
          i={i}
          r={r}
          paramType={paramTypes[i]}
          help={devMethod?.params?.[paramTypes[i].name]}
        />
      ))}
    </tbody>
  </table>
);

export default React.memo(DecodedParamsTable);
