import React, { ReactNode } from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import Copy from "../components/Copy";
import { ParamType } from "@ethersproject/abi";
import { TransactionData } from "../types";

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
}) => {
  return (
    <>
      <tr className="grid grid-cols-12 gap-x-2 py-2 hover:bg-gray-100">
        <td className="col-span-3 pl-1">
          {prefix && <span className="text-gray-300">{prefix}</span>}
          {arrayElem !== undefined ? (
            <span className="text-gray-400">{" "}
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
          {paramType.baseType === "address" ? (
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
          ) : paramType.baseType === "bool" ? (
            <span className={`${r ? "text-green-700" : "text-red-700"}`}>
              {r.toString()}
            </span>
          ) : paramType.baseType === "bytes" ? (
            <span>
              {r.toString()}{" "}
              <span className="font-sans text-xs text-gray-400">
                {r.toString().length / 2 - 1}{" "}
                {r.toString().length / 2 - 1 === 1 ? "byte" : "bytes"}
              </span>
            </span>
          ) : paramType.baseType === "tuple" ||
            paramType.baseType === "array" ? (
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
            prefix={paramType.name + "."}
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
};

export default React.memo(DecodedParamRow);
