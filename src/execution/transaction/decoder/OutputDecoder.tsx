import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { AbiCoder, ParamType, Result } from "ethers";
import React, { useEffect, useState } from "react";

import ModeTab from "../../../components/ModeTab";
import StandardTextarea from "../../../components/StandardTextarea";
import { DevMethod } from "../../../sourcify/useSourcify";
import DecodedParamsTable from "./DecodedParamsTable";

/**
 * Convert a comma-separated list of type names into ParamType objects.
 * Returns null if the type string is empty or invalid.
 */
function parseTypeString(typeString: string): readonly ParamType[] | null {
  const raw = typeString.trim();
  if (raw.length === 0) {
    return null;
  }

  try {
    return ParamType.from(`(${raw})`).components;
  } catch {
    return null;
  }
}

type OutputDecoderProps = {
  args: Result | null | undefined;
  paramTypes: readonly ParamType[] | null | undefined;
  data: string;
  devMethod?: DevMethod;
};

const OutputDecoder: React.FC<OutputDecoderProps> = ({
  args,
  paramTypes,
  data,
  devMethod,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [customTypeInput, setCustomTypeInput] = useState<string>("");
  const [customParamTypes, setCustomParamTypes] = useState<
    readonly ParamType[] | null
  >(null);
  const [customDecoded, setCustomDecoded] = useState<Result | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  // Parse and decode whenever the user types a new type string
  useEffect(() => {
    setCustomParamTypes(null);
    setCustomDecoded(null);
    setCustomError(null);

    if (!customTypeInput.trim()) {
      return;
    }

    const parsed = parseTypeString(customTypeInput);
    if (!parsed) {
      setCustomError("Could not parse the supplied type(s).");
      return;
    }
    setCustomParamTypes(parsed);

    try {
      const decodedProxy = AbiCoder.defaultAbiCoder().decode(parsed, data);
      // Throws if there were deferred ABI decoding errors
      decodedProxy.toArray(true);

      setCustomDecoded(decodedProxy);
    } catch {
      setCustomError(
        "Decoding failed: the data does not match the supplied type(s).",
      );
    }
  }, [customTypeInput, data]);

  // If `paramTypes` is falsy we have three tabs (Decoded, Raw, Custom)
  // otherwise only two tabs (Decoded, Raw)
  const hasCustom = !paramTypes;
  const customTabIdx = hasCustom ? 2 : -1;

  return (
    <TabGroup selectedIndex={selectedIdx} onChange={setSelectedIdx}>
      <TabList className="mb-1 flex items-center space-x-1">
        <ModeTab disabled={!paramTypes}>Decoded</ModeTab>
        <ModeTab>Raw</ModeTab>
        {/* Only rendered when Decoded is disabled */}
        {hasCustom && <ModeTab>Custom</ModeTab>}

        {/* Show the input field when the Custom tab is active */}
        {hasCustom && selectedIdx === customTabIdx && (
          <div className="ml-1">
            <input
              type="text"
              className="rounded-md border border-gray-300 bg-white px-2 py-1 -mt-1 -mb-1 text-sm w-96"
              placeholder='Solidity type, e.g. "address[]"'
              value={customTypeInput}
              onChange={(e) => setCustomTypeInput(e.target.value)}
              list="custom-type-options"
            />
            {/* Autocomplete suggestions */}
            <datalist id="custom-type-options">
              <option value="address" />
              <option value="uint256" />
            </datalist>
          </div>
        )}
      </TabList>

      <TabPanels>
        <TabPanel>
          {data === "0x" ? (
            <>No data</>
          ) : paramTypes === undefined || args === undefined ? (
            <>Waiting for data...</>
          ) : paramTypes === null || args === null ? (
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

        {hasCustom && (
          <TabPanel>
            <div className="space-y-4 mt-2">
              {customError && (
                <p className="text-sm text-red-600">{customError}</p>
              )}

              {/* Show table when decoded successfully */}
              {customDecoded && customParamTypes && (
                <DecodedParamsTable
                  args={customDecoded}
                  paramTypes={customParamTypes}
                  hasParamNames={false}
                  devMethod={undefined}
                  defaultNameBase="ret"
                />
              )}
            </div>
          </TabPanel>
        )}
      </TabPanels>
    </TabGroup>
  );
};

export default OutputDecoder;
