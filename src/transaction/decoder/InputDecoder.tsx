import React from "react";
import { TransactionDescription } from "@ethersproject/abi";
import { Tab } from "@headlessui/react";
import ModeTab from "../../components/ModeTab";
import DecodedParamsTable from "./DecodedParamsTable";
import { TransactionData } from "../../types";
import { DevMethod, UserMethod } from "../../useSourcify";
import { ResolvedAddresses } from "../../api/address-resolver";

type InputDecoderProps = {
  fourBytes: string;
  resolvedTxDesc: TransactionDescription | null | undefined;
  txDesc: TransactionDescription | null | undefined;
  txData: TransactionData;
  userMethod: UserMethod | undefined;
  devMethod: DevMethod | undefined;
  utfInput: string;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const InputDecoder: React.FC<InputDecoderProps> = ({
  fourBytes,
  resolvedTxDesc,
  txDesc,
  txData,
  userMethod,
  devMethod,
  utfInput,
  resolvedAddresses,
}) => (
  <Tab.Group>
    <Tab.List className="flex space-x-1 mb-1">
      <ModeTab>Decoded</ModeTab>
      <ModeTab>Raw</ModeTab>
      <ModeTab>UTF-8</ModeTab>
    </Tab.List>
    <Tab.Panels>
      <Tab.Panel>
        {fourBytes === "0x" ? (
          <>No parameters</>
        ) : resolvedTxDesc === undefined ? (
          <>Waiting for data...</>
        ) : resolvedTxDesc === null ? (
          <>Can't decode data</>
        ) : (
          <DecodedParamsTable
            args={resolvedTxDesc.args}
            paramTypes={resolvedTxDesc.functionFragment.inputs}
            txData={txData}
            hasParamNames={resolvedTxDesc === txDesc}
            userMethod={userMethod}
            devMethod={devMethod}
            resolvedAddresses={resolvedAddresses}
          />
        )}
      </Tab.Panel>
      <Tab.Panel>
        <textarea
          className="w-full h-40 bg-gray-50 text-gray-500 font-mono focus:outline-none border rounded p-2"
          value={txData.data}
          readOnly
        />
      </Tab.Panel>
      <Tab.Panel>
        <textarea
          className="w-full h-40 bg-gray-50 text-gray-500 font-mono focus:outline-none border rounded p-2"
          value={utfInput}
          readOnly
        />
      </Tab.Panel>
    </Tab.Panels>
  </Tab.Group>
);

export default InputDecoder;
