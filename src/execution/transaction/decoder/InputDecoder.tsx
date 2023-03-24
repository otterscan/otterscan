import React, { useMemo } from "react";
import { TransactionDescription } from "@ethersproject/abi";
import { toUtf8String } from "@ethersproject/strings";
import { Tab } from "@headlessui/react";
import ModeTab from "../../../components/ModeTab";
import DecodedParamsTable from "./DecodedParamsTable";
import StandardTextarea from "../../../components/StandardTextarea";
import { DevMethod, UserMethod } from "../../../sourcify/useSourcify";

type InputDecoderProps = {
  fourBytes: string;
  resolvedTxDesc: TransactionDescription | null | undefined;
  hasParamNames: boolean;
  data: string;
  userMethod: UserMethod | undefined;
  devMethod: DevMethod | undefined;
};

const InputDecoder: React.FC<InputDecoderProps> = ({
  fourBytes,
  resolvedTxDesc,
  hasParamNames,
  data,
  userMethod,
  devMethod,
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
      <Tab.List className="mb-1 flex space-x-1">
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
              signature={resolvedTxDesc.signature}
              args={resolvedTxDesc.args}
              paramTypes={resolvedTxDesc.functionFragment.inputs}
              hasParamNames={hasParamNames}
              userMethod={userMethod}
              devMethod={devMethod}
            />
          )}
        </Tab.Panel>
        <Tab.Panel>
          <StandardTextarea value={data} />
        </Tab.Panel>
        <Tab.Panel>
          <StandardTextarea value={utfInput} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default InputDecoder;
