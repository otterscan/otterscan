import React, { useState, useEffect, useContext } from "react";
import { Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import ContentFrame from "../../components/ContentFrame";
import InfoRow from "../../components/InfoRow";
import Contract from "./Contract";
import ContractFromRepo from "./ContractFromRepo";
import { RuntimeContext } from "../../useRuntime";
import { Match, MatchType } from "../../sourcify/useSourcify";
import ExternalLink from "../../components/ExternalLink";
import { openInRemixURL } from "../../url";
import ContractABI from "./contract/ContractABI";
import { commify } from "../../utils/utils";

type ContractsProps = {
  checksummedAddress: string;
  match: Match | null | undefined;
};

const Contracts: React.FC<ContractsProps> = ({ checksummedAddress, match }) => {
  const { provider } = useContext(RuntimeContext);

  const [selected, setSelected] = useState<string>();
  useEffect(() => {
    if (match) {
      setSelected(Object.keys(match.metadata.sources)[0]);
    }
  }, [match]);
  const optimizer = match?.metadata.settings?.optimizer;

  return (
    <ContentFrame tabs>
      {match && (
        <>
          <InfoRow title="Match">
            {match.type === MatchType.FULL_MATCH ? "Full" : "Partial"}
          </InfoRow>
          <InfoRow title="Language">
            <span>{match.metadata.language}</span>
          </InfoRow>
          <InfoRow title="Compiler">
            <span>{match.metadata.compiler.version}</span>
          </InfoRow>
          <InfoRow title="Optimizer Enabled">
            {optimizer?.enabled ? (
              <span>
                <span className="font-bold text-emerald-600">Yes</span> with{" "}
                <span className="font-bold text-emerald-600">
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
        {match === undefined && (
          <span>Getting data from Sourcify repository...</span>
        )}
        {match === null && (
          <span>
            Address is not a contract or couldn't find contract metadata in
            Sourcify repository.
          </span>
        )}
        {match !== undefined && match !== null && (
          <>
            {match.metadata.output.abi && (
              <ContractABI abi={match.metadata.output.abi} />
            )}
            <div>
              <Menu>
                <div className="flex items-baseline justify-between space-x-2">
                  <Menu.Button className="flex space-x-2 rounded-t border-l border-r border-t px-2 py-1 text-sm">
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
                  <Menu.Items className="absolute flex flex-col rounded-b border bg-white p-1">
                    {Object.entries(match.metadata.sources).map(([k]) => (
                      <Menu.Item key={k}>
                        <button
                          className={`flex px-2 py-1 text-sm ${
                            selected === k
                              ? "bg-gray-200 font-bold text-gray-500"
                              : "text-gray-400 transition-colors duration-75 hover:text-gray-500"
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
                <>
                  {match.metadata.sources[selected].content ? (
                    <Contract
                      content={match.metadata.sources[selected].content}
                    />
                  ) : (
                    <ContractFromRepo
                      checksummedAddress={checksummedAddress}
                      networkId={provider!.network.chainId}
                      filename={selected}
                      type={match.type}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Contracts);
