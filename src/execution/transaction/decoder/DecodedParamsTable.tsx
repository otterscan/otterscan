import { ParamType, Result } from "ethers";
import { FC, memo } from "react";
import { DevMethod, UserMethod } from "../../../sourcify/useSourcify";
import DecodedParamRow from "./DecodedParamRow";

type DecodedParamsTableProps = {
  args: Result;
  paramTypes: readonly ParamType[];
  hasParamNames?: boolean;
  userMethod?: UserMethod | undefined;
  devMethod?: DevMethod | undefined;
  defaultNameBase?: string;
};

const DecodedParamsTable: FC<DecodedParamsTableProps> = ({
  args,
  paramTypes,
  hasParamNames = true,
  userMethod,
  devMethod,
  defaultNameBase = "param",
}) => {
  return (
    <table className="w-full border">
      <thead className="bg-gray-100 text-left">
        <tr className="grid grid-cols-12 gap-x-2 py-2">
          <th className="col-span-3 pl-1">
            name <span className="text-xs text-gray-400">(index)</span>
          </th>
          <th className="col-span-1">type</th>
          <th className="col-span-8 pr-1">value</th>
        </tr>
        {!hasParamNames && (
          <tr className="grid grid-cols-12 gap-x-2 bg-amber-100 py-2 text-red-700">
            <th className="col-span-12 px-1">
              {paramTypes.length > 0 && paramTypes[0].name !== ""
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
            defaultNameBase={defaultNameBase}
          />
        ))}
      </tbody>
    </table>
  );
};

export default memo(DecodedParamsTable);
