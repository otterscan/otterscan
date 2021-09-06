import React, { useState, useEffect, useContext, Fragment } from "react";
import { commify } from "@ethersproject/units";
import { Tab } from "@headlessui/react";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import Contract from "./Contract";
import { RuntimeContext } from "../useRuntime";
import { Metadata } from "../useSourcify";

type ContractsProps = {
  checksummedAddress: string;
  rawMetadata: Metadata | null | undefined;
};

const Contracts: React.FC<ContractsProps> = ({
  checksummedAddress,
  rawMetadata,
}) => {
  const { provider } = useContext(RuntimeContext);

  const [selected, setSelected] = useState<string>();
  useEffect(() => {
    if (rawMetadata) {
      setSelected(Object.keys(rawMetadata.sources)[0]);
    }
  }, [rawMetadata]);
  const optimizer = rawMetadata?.settings?.optimizer;

  return (
    <ContentFrame tabs>
      {rawMetadata && (
        <>
          <InfoRow title="Language">
            <span>{rawMetadata.language}</span>
          </InfoRow>
          <InfoRow title="Compiler">
            <span>{rawMetadata.compiler.version}</span>
          </InfoRow>
          <InfoRow title="Optimizer Enabled">
            {optimizer?.enabled ? (
              <span>
                <span className="font-bold text-green-600">Yes</span> with{" "}
                <span className="font-bold text-green-600">
                  {commify(optimizer?.runs)}
                </span>{" "}
                runs
              </span>
            ) : (
              <span className="font-bold text-red-600">No</span>
            )}
          </InfoRow>
        </>
      )}
      <div className="py-5">
        {rawMetadata === null && (
          <span>Couldn't find contract metadata in Sourcify repository.</span>
        )}
        {rawMetadata !== undefined && rawMetadata !== null && (
          <div>
            <Tab.Group>
              <Tab.List className="flex truncate">
                {Object.entries(rawMetadata.sources).map(([k]) => (
                  <Tab key={k} as={Fragment}>
                    <button
                      className={`border-b-2 border-transparent rounded-t text-sm px-2 py-1 ${
                        selected === k
                          ? "border-orange-300 font-bold bg-gray-200 text-gray-500"
                          : "hover:border-orange-200 bg-gray-100 hover:text-gray-500 text-gray-400 transition-transform transition-colors duration-75 transform origin-bottom scale-95 hover:scale-100"
                      }`}
                      onClick={() => setSelected(k)}
                    >
                      {k}
                    </button>
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
            {selected && (
              <Contract
                checksummedAddress={checksummedAddress}
                networkId={provider!.network.chainId}
                filename={selected}
                source={rawMetadata.sources[selected]}
              />
            )}
          </div>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Contracts);
