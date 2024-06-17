import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ParamType, Result } from "ethers";
import React from "react";
import ModeTab from "../../../components/ModeTab";
import StandardTextarea from "../../../components/StandardTextarea";
import { DevMethod } from "../../../sourcify/useSourcify";
import DecodedParamsTable from "./DecodedParamsTable";

type OutputDecoderProps = {
  args: Result | undefined;
  paramTypes: readonly ParamType[] | null | undefined;
  data: string;
  devMethod?: DevMethod;
};

const OutputDecoder: React.FC<OutputDecoderProps> = ({
  args,
  paramTypes,
  data,
  devMethod,
}) => (
  <TabGroup>
    <TabList className="mb-1 flex space-x-1">
      <ModeTab disabled={!paramTypes}>Decoded</ModeTab>
      <ModeTab>Raw</ModeTab>
    </TabList>
    <TabPanels>
      <TabPanel>
        {data === "0x" ? (
          <>No data</>
        ) : paramTypes === undefined || args === undefined ? (
          <>Waiting for data...</>
        ) : paramTypes === null ? (
          <>Can't decode data</>
        ) : (
          <div className="space-y-2">
            <DecodedParamsTable
              args={args}
              paramTypes={paramTypes}
              hasParamNames={true}
              devMethod={devMethod}
              defaultNameBase="ret"
            />
          </div>
        )}
      </TabPanel>
      <TabPanel>
        <StandardTextarea value={data} />
      </TabPanel>
    </TabPanels>
  </TabGroup>
);

export default OutputDecoder;
