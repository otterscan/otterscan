import { FC, memo } from "react";
import { Tab } from "@headlessui/react";
import ModeTab from "../components/ModeTab";
import Copy from "../components/Copy";
import DecodedABI from "./DecodedABI";
import RawABI from "./RawABI";

type ContractABIProps = {
  abi: any[];
};

const ContractABI: FC<ContractABIProps> = ({ abi }) => (
  <div className="mb-3">
    <Tab.Group>
      <Tab.List className="mb-1 flex items-baseline space-x-1">
        <div className="flex items-baseline space-x-2 py-1 pr-2 text-sm">
          <span>ABI</span>
          <Copy value={JSON.stringify(abi)} />
        </div>
        <ModeTab>Decoded</ModeTab>
        <ModeTab>Raw</ModeTab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <DecodedABI abi={abi} />
        </Tab.Panel>
        <Tab.Panel>
          <RawABI abi={abi} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  </div>
);

export default memo(ContractABI);
