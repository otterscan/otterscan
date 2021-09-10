import React, { useState, useEffect, useContext, Fragment } from "react";
import { commify } from "@ethersproject/units";
import { Menu, RadioGroup } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import ABI from "./ABI";
import Contract from "./Contract";
import { RuntimeContext } from "../useRuntime";
import { Metadata } from "../useSourcify";
import ExternalLink from "../components/ExternalLink";
import { openInRemixURL, SourcifySource } from "../url";
import RadioButton from "./RadioButton";

type ContractsProps = {
  checksummedAddress: string;
  rawMetadata: Metadata | null | undefined;
  sourcifySource: SourcifySource;
  setSourcifySource: (sourcifySource: SourcifySource) => void;
};

const Contracts: React.FC<ContractsProps> = ({
  checksummedAddress,
  rawMetadata,
  sourcifySource,
  setSourcifySource,
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
      <InfoRow title="Sourcify integration">
        <RadioGroup value={sourcifySource} onChange={setSourcifySource}>
          <div className="flex space-x-2">
            <RadioButton value={SourcifySource.IPFS_IPNS}>
              Resolve IPNS
            </RadioButton>
            <RadioButton value={SourcifySource.CENTRAL_SERVER}>
              Sourcify Servers
            </RadioButton>
            <RadioButton value={SourcifySource.CUSTOM_SNAPSHOT_SERVER}>
              Local Snapshot
            </RadioButton>
          </div>
        </RadioGroup>
      </InfoRow>
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
        {rawMetadata === undefined && (
          <span>Getting data from Sourcify repository...</span>
        )}
        {rawMetadata === null && (
          <span>
            Address is not a contract or couldn't find contract metadata in
            Sourcify repository.
          </span>
        )}
        {rawMetadata !== undefined && rawMetadata !== null && (
          <>
            {rawMetadata.output.abi && (
              <div className="mb-3">
                <div className="flex space-x-2 text-sm border-l border-r border-t rounded-t px-2 py-1">
                  ABI
                </div>
                <ABI abi={rawMetadata.output.abi} />
              </div>
            )}
            <div>
              <Menu>
                <div className="flex space-x-2 justify-between items-baseline">
                  <Menu.Button className="flex space-x-2 text-sm border-l border-r border-t rounded-t px-2 py-1">
                    <span>{selected}</span>
                    <span className="self-center">
                      <FontAwesomeIcon icon={faChevronDown} size="xs" />
                    </span>
                  </Menu.Button>
                  {provider && (
                    <div className="text-sm">
                      <ExternalLink
                        href={openInRemixURL(
                          checksummedAddress,
                          provider.network.chainId
                        )}
                      >
                        Open in Remix
                      </ExternalLink>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Menu.Items className="absolute border p-1 rounded-b bg-white flex flex-col">
                    {Object.entries(rawMetadata.sources).map(([k]) => (
                      <Menu.Item key={k}>
                        <button
                          className={`flex text-sm px-2 py-1 ${
                            selected === k
                              ? "font-bold bg-gray-200 text-gray-500"
                              : "hover:border-orange-200 hover:text-gray-500 text-gray-400 transition-transform transition-colors duration-75"
                          }`}
                          onClick={() => setSelected(k)}
                        >
                          {k}
                        </button>
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </div>
              </Menu>
              {selected && (
                <Contract
                  checksummedAddress={checksummedAddress}
                  networkId={provider!.network.chainId}
                  filename={selected}
                  source={rawMetadata.sources[selected]}
                  sourcifySource={sourcifySource}
                />
              )}
            </div>
          </>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Contracts);
