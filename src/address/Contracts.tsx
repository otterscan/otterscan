import React, { useState, useEffect, useContext, Fragment } from "react";
import { commify } from "@ethersproject/units";
import { Menu, Switch } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import Contract from "./Contract";
import { RuntimeContext } from "../useRuntime";
import { Metadata } from "../useSourcify";
import ExternalLink from "../components/ExternalLink";
import { openInRemixURL } from "../url";

type ContractsProps = {
  checksummedAddress: string;
  rawMetadata: Metadata | null | undefined;
  useIPFS: boolean;
  setUseIPFS: (useIPFS: boolean) => void;
};

const Contracts: React.FC<ContractsProps> = ({
  checksummedAddress,
  rawMetadata,
  useIPFS,
  setUseIPFS,
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
      <InfoRow title="Use IPFS">
        <Switch
          className={`flex items-center h-7 w-12 px-1 rounded-full transition duration-200 ${
            useIPFS ? "bg-blue-500" : "bg-blue-900"
          }`}
          checked={useIPFS}
          onChange={setUseIPFS}
        >
          <span
            className={`inline-block border rounded-full w-5 h-5 bg-white transform duration-200 ${
              useIPFS ? "" : "translate-x-5"
            }`}
          ></span>
        </Switch>
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
        {rawMetadata === null && (
          <span>Couldn't find contract metadata in Sourcify repository.</span>
        )}
        {rawMetadata !== undefined && rawMetadata !== null && (
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
                useIPFS={useIPFS}
              />
            )}
          </div>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Contracts);
