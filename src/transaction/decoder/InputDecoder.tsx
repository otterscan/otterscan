import React, { useMemo } from "react";
import { TransactionDescription } from "@ethersproject/abi";
import { toUtf8String } from "@ethersproject/strings";
import { Tab } from "@headlessui/react";
import ModeTab from "../../components/ModeTab";
import DecodedParamsTable from "./DecodedParamsTable";
import { DevMethod, UserMethod } from "../../useSourcify";
import { ResolvedAddresses } from "../../api/address-resolver";

type InputDecoderProps = {
  fourBytes: string;
  resolvedTxDesc: TransactionDescription | null | undefined;
  hasParamNames: boolean;
  data: string;
  userMethod: UserMethod | undefined;
  devMethod: DevMethod | undefined;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const InputDecoder: React.FC<InputDecoderProps> = ({
  fourBytes,
  resolvedTxDesc,
  hasParamNames,
  data,
  userMethod,
  devMethod,
  resolvedAddresses,
}) => {
  const utfInput = useMemo(() => {
    try {
      return toUtf8String(data);
    } catch (err) {
      // Silently ignore on purpose
      return undefined;
    }
  }, [data]);

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 mb-1">
        <ModeTab disabled={!resolvedTxDesc}>Decoded</ModeTab>
        <ModeTab>Raw</ModeTab>
        <ModeTab disabled={utfInput === undefined}>UTF-8</ModeTab>
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
              hasParamNames={hasParamNames}
              userMethod={userMethod}
              devMethod={devMethod}
              resolvedAddresses={resolvedAddresses}
            />
          )}
        </Tab.Panel>
        <Tab.Panel>
          <textarea
            className="w-full h-40 bg-gray-50 text-gray-500 font-mono focus:outline-none border rounded p-2"
            value={data}
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
};

export default InputDecoder;
