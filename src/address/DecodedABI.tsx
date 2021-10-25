import { Interface } from "@ethersproject/abi";
import React from "react";
import DecodedFragment from "./DecodedFragment";

type DecodedABIProps = {
  abi: any[];
};

const DecodedABI: React.FC<DecodedABIProps> = ({ abi }) => {
  const intf = new Interface(abi);
  return (
    <div className="border overflow-x-auto">
      {intf.fragments.map((f, i) => (
        <DecodedFragment key={i} intf={intf} fragment={f} />
      ))}
    </div>
  );
};

export default React.memo(DecodedABI);
