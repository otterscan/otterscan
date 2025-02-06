import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { FC, memo } from "react";
import Copy from "../../../components/Copy";
import ModeTab from "../../../components/ModeTab";
import { ABIAwareComponentProps } from "../../types";
import DecodedABI from "./DecodedABI";
import RawABI from "./RawABI";

const ContractABI: FC<ABIAwareComponentProps> = ({
  abi,
  unknownSelectors,
  address,
}) => (
  <div className="mb-3">
    <TabGroup>
      <TabList className="mb-1 flex items-baseline space-x-1">
        <div className="flex items-baseline space-x-2 py-1 pr-2 text-sm">
          <span>ABI</span>
          <Copy value={JSON.stringify(abi)} />
        </div>
        <ModeTab>Decoded</ModeTab>
        <ModeTab>Raw</ModeTab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <DecodedABI
            abi={abi}
            unknownSelectors={unknownSelectors}
            address={address}
          />
        </TabPanel>
        <TabPanel>
          <RawABI abi={abi} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
);

export default memo(ContractABI);
