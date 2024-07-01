import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import React, { lazy, useContext, useEffect, useState } from "react";
import ContentFrame from "../../components/ContentFrame";
import ExternalLink from "../../components/ExternalLink";
import InfoRow from "../../components/InfoRow";
import StandardTextarea from "../../components/StandardTextarea";
import { Match, MatchType } from "../../sourcify/useSourcify";
import { openInRemixURL } from "../../url";
import { useGetCode } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import { commify } from "../../utils/utils";
import ContractFromRepo from "./ContractFromRepo";
import WhatsabiWarning from "./WhatsabiWarning";
import ContractABI from "./contract/ContractABI";

const HighlightedSolidity = lazy(
  () => import("./contract/HighlightedSolidity"),
);

type ContractsProps = {
  checksummedAddress: string;
  match: Match | null | undefined;
};

const Contracts: React.FC<ContractsProps> = ({ checksummedAddress, match }) => {
  const { provider } = useContext(RuntimeContext);
  usePageTitle(`Contract | ${checksummedAddress}`);
  const code = useGetCode(provider, checksummedAddress);

  const [selected, setSelected] = useState<string>();
  useEffect(() => {
    if (match) {
      const targetSource = match.metadata.settings?.compilationTarget;
      if (targetSource !== undefined && Object.keys(targetSource)[0] !== "") {
        setSelected(Object.keys(targetSource)[0]);
      } else {
        setSelected(Object.keys(match.metadata.sources)[0]);
      }
    }
  }, [match]);
  const optimizer = match?.metadata.settings?.optimizer;

  return (
    <ContentFrame tabs>
      {match && match.type === MatchType.WHATSABI_GUESS && <WhatsabiWarning />}
      {match && match.type !== MatchType.WHATSABI_GUESS && (
        <>
          {match.metadata.settings?.compilationTarget && (
            <InfoRow title="Name">
              {Object.values(match.metadata.settings.compilationTarget)[0]}
            </InfoRow>
          )}
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
              <ContractABI
                abi={match.metadata.output.abi}
                unknownSelectors={match.unknownSelectors}
                address={checksummedAddress}
              />
            )}
            {match.type !== MatchType.WHATSABI_GUESS && (
              <div>
                <Menu>
                  <div className="flex items-baseline justify-between space-x-2">
                    <MenuButton className="flex space-x-2 rounded-t border-l border-r border-t px-2 py-1 text-sm">
                      <span>{selected}</span>
                      <span className="self-center">
                        <FontAwesomeIcon icon={faChevronDown} size="xs" />
                      </span>
                    </MenuButton>
                    {provider && (
                      <div className="text-sm">
                        <ExternalLink
                          href={openInRemixURL(
                            checksummedAddress,
                            provider._network.chainId,
                          )}
                        >
                          Open in Remix
                        </ExternalLink>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <MenuItems className="absolute z-10 flex flex-col rounded-b border bg-white p-1">
                      {Object.entries(match.metadata.sources).map(([k]) => (
                        <MenuItem key={k}>
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
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </div>
                </Menu>
                {selected && (
                  <>
                    {match.metadata.sources[selected].content ? (
                      <HighlightedSolidity
                        source={match.metadata.sources[selected].content}
                      />
                    ) : (
                      <ContractFromRepo
                        checksummedAddress={checksummedAddress}
                        networkId={provider!._network.chainId}
                        filename={selected}
                        type={match.type}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="py-5">
        {code === undefined && <span>Getting contract bytecode...</span>}
        {code && (
          <>
            <div className="pb-2">Contract Bytecode</div>
            <StandardTextarea value={code} />
          </>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Contracts);
