import { ParamType, Result } from "ethers";
import { FC, memo } from "react";
import { DevMethod, UserMethod } from "../../../sourcify/useSourcify";
import DecodedParamRow from "./DecodedParamRow";

type DecodedScillaParamsTableProps = {
  params: object;
};

type DecodedScillaParamRowProps = {
  name: string;
  valueType: string;
  value: string;
};

const DecodedScillaParamRow: FC<DecodedScillaParamRowProps> = ({
  name,
  valueType,
  value }) => {
  return (
    <>
      <tr className="grid grid-cols-12 gap-x-2 py-2 hover:bg-gray-100">
      <td className="col-span-3 pl-1">
      <span className="text-gray-600">{name}</span>
      </td>
      <td className="col-span-1 text-gray-500">{valueType}</td>
      <td className="col-span-8 text-gray-500">{value}</td>
      </tr>
      </>
  )};


const DecodedScillaParamsTable: FC<DecodedScillaParamsTableProps> = ({
  params } ) => {
    // params.map((val) => { alert(`X ${JSON.stringify(val)}`) });
    return (
  <table className="w-full border">
    <thead>
      <tr className="grid grid-cols-12 gap-x-2 bg-gray-100 py-2 text-left">
        <th className="col-span-3 pl-1">
          name
        </th>
        <th className="col-span-1 pl-1">
        type
        </th>
        <th className="col-span-8 pr-1">value</th>
      </tr>
    </thead>
      <tbody className="divide-y">
        {params.map((val) => (
          <DecodedScillaParamRow name={val["vname"]} valueType={val["type"]}  value={val["value"]} />
        ))}
    </tbody>
      </table>
    );
  }

export default memo(DecodedScillaParamsTable);
