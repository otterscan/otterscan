import React, { ReactNode } from "react";
import { ParamType } from "@ethersproject/abi";
import Uint256Decoder from "./Uint256Decoder";
import AddressDecoder from "./AddressDecoder";
import BooleanDecoder from "./BooleanDecoder";
import BytesDecoder from "./BytesDecoder";
import { TransactionData } from "../../types";

type DecodedParamRowProps = {
  prefix?: ReactNode;
  i?: number | undefined;
  r: any;
  paramType: ParamType;
  txData: TransactionData;
  arrayElem?: number | undefined;
};

const DecodedParamRow: React.FC<DecodedParamRowProps> = ({
  prefix,
  i,
  r,
  paramType,
  txData,
  arrayElem,
}) => (
  <>
    <tr className="grid grid-cols-12 gap-x-2 py-2 hover:bg-gray-100">
      <td className="col-span-3 pl-1">
        {prefix && <span className="text-gray-300">{prefix}</span>}
        {arrayElem !== undefined ? (
          <span className="text-gray-400">
            {" "}
            [<span className="text-black">{arrayElem}</span>]
          </span>
        ) : (
          <>
            {paramType.name ?? <span className="italic">param_{i}</span>}{" "}
            {i !== undefined && (
              <span className="text-gray-400 text-xs">({i})</span>
            )}
          </>
        )}
      </td>
      <td className="col-span-1 text-gray-500">{paramType.type}</td>
      <td className="col-span-8 pr-1 font-code break-all">
        {paramType.baseType === "uint256" ? (
          <Uint256Decoder r={r} />
        ) : paramType.baseType === "address" ? (
          <AddressDecoder r={r} txData={txData} />
        ) : paramType.baseType === "bool" ? (
          <BooleanDecoder r={r} />
        ) : paramType.baseType === "bytes" ? (
          <BytesDecoder r={r} />
        ) : paramType.baseType === "tuple" || paramType.baseType === "array" ? (
          <></>
        ) : (
          r.toString()
        )}
      </td>
    </tr>
    {paramType.baseType === "tuple" &&
      r.map((e: any, idx: number) => (
        <DecodedParamRow
          key={idx}
          prefix={
            paramType.name ? (
              paramType.name + "."
            ) : (
              <span className="italic">param_{i}.</span>
            )
          }
          i={idx}
          r={e}
          paramType={paramType.components[idx]}
          txData={txData}
        />
      ))}
    {paramType.baseType === "array" &&
      r.map((e: any, idx: number) => (
        <DecodedParamRow
          key={idx}
          prefix={paramType.name ?? <span className="italic">param_{i}</span>}
          r={e}
          paramType={paramType.arrayChildren}
          txData={txData}
          arrayElem={idx}
        />
      ))}
  </>
);

export default React.memo(DecodedParamRow);
