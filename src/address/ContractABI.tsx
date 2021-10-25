import React from "react";
import Copy from "../components/Copy";
import RawABI from "./RawABI";

type ContractABIProps = {
  abi: any[];
};

const ContractABI: React.FC<ContractABIProps> = ({ abi }) => (
  <div className="mb-3">
    <div className="flex space-x-2 text-sm border-l border-r border-t rounded-t px-2 py-1">
      <span>ABI</span>
      <Copy value={JSON.stringify(abi)} />
    </div>
    <RawABI abi={abi} />
  </div>
);

export default React.memo(ContractABI);
