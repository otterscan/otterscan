import React from "react";
import { Tab } from "@headlessui/react";
import ModeTab from "../components/ModeTab";
import Copy from "../components/Copy";
import DecodedABI from "./DecodedABI";
import RawABI from "./RawABI";

type ContractABIProps = {
  abi: any[];
};

const ContractABI: React.FC<ContractABIProps> = ({ abi }) => (
  <div className="mb-3">
    <Tab.Group>
      <Tab.List className="flex space-x-1 mb-1">
        <ModeTab>Decoded</ModeTab>
        <ModeTab>Raw</ModeTab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <DecodedABI abi={abi} />
        </Tab.Panel>
        <Tab.Panel>
          <div className="flex space-x-2 text-sm border-l border-r border-t rounded-t px-2 py-1">
            <span>ABI</span>
            <Copy value={JSON.stringify(abi)} />
          </div>
          <RawABI abi={abi} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  </div>
);

export default React.memo(ContractABI);
