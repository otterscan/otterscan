import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import React, { lazy, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { type DecorationOptions } from "shiki";
import ContentFrame from "../../components/ContentFrame";
import ExternalLink from "../../components/ExternalLink";
import InfoRow from "../../components/InfoRow";
import StandardTextarea from "../../components/StandardTextarea";
import { Match, MatchType, getLangName } from "../../sourcify/useSourcify";
import { openInRemixURL } from "../../url";
import { getCodeQuery } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import { commify } from "../../utils/utils";
import ContractFromRepo from "./ContractFromRepo";
import WhatsabiWarning from "./WhatsabiWarning";
import ContractABI from "./contract/ContractABI";
import ContractVerificationSteps from "./contract/ContractVerificationSteps";

const HighlightedSource = lazy(() => import("./contract/HighlightedSource"));

type ContractsProps = {
  checksummedAddress: string;
  match: Match | null | undefined;
};

const Contracts: React.FC<ContractsProps> = ({ checksummedAddress, match }) => {
  const { provider } = useContext(RuntimeContext);
  const [showLocalVerification, setShowLocalVerification] = useState(false);
  usePageTitle(`Contract | ${checksummedAddress}`);
  const { data: code } = useQuery(
    getCodeQuery(provider, checksummedAddress, "latest"),
  );

  // Currently selected source file
  const [selected, setSelected] = useState<string>();
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (match) {
      const targetSource = match.metadata.settings?.compilationTarget;
      let defaultTargetSource =
        targetSource !== undefined && Object.keys(targetSource)[0] !== ""
          ? Object.keys(targetSource)[0]
          : Object.keys(match.metadata.sources)[0];
      let selectedKey = defaultTargetSource;
      const sourceSearchParam = searchParams.get("source");
      if (sourceSearchParam !== null) {
        if (Object.keys(match.metadata.sources).includes(sourceSearchParam)) {
          selectedKey = sourceSearchParam;
        } else {
          setSearchParams({
            ...Object.fromEntries(searchParams),
            source: selectedKey,
          });
        }
      }
      setSelected(selectedKey);
    }
  }, [match]);
  const optimizer = match?.metadata.settings?.optimizer;

  // Highlighted region
  const [highlightOffsets, setHighlightOffsets] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [highlightLines, setHighlightLines] = useState<number[] | null>(null);
  useEffect(() => {
    const hrParam = searchParams.get("hr");
    if (hrParam) {
      const split = hrParam.split("-");
      if (split.length < 2) {
        return;
      }
      const [start, end] = split.map(Number).map(Math.floor);
      if (isNaN(start) || isNaN(end)) {
        console.error("Invalid offsets in URL parameter");
      } else {
        setHighlightOffsets({ start, end });
      }
    }

    const hlParam = searchParams.get("hl");
    if (hlParam) {
      const lines = hlParam
        .split("-")
        .map(Number)
        .map(Math.floor)
        .filter((line) => !isNaN(line));
      if (lines.length !== 2) {
        console.error("Invalid lines in URL parameter");
      } else {
        setHighlightLines(lines);
      }
    }
  }, [searchParams]);

  const sourceDecorations: DecorationOptions["decorations"] | undefined = [];

  if (highlightLines && highlightLines.length === 2) {
    sourceDecorations.push({
      start: { line: highlightLines[0] - 1, character: 0 },
      end: { line: highlightLines[1], character: 0 },
      properties: { class: "bg-source-line-bg-highlight bg-clip-padding" },
    });
  }

  if (highlightOffsets) {
    sourceDecorations.push({
      ...highlightOffsets,
      properties: { class: "bg-source-line-highlight bg-clip-padding" },
    });
  }

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

            {!showLocalVerification && (
              <button
                type="button"
                onClick={() => setShowLocalVerification(true)}
                className="ml-3 px-2 py-1 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-100 text-xs"
              >
                Verify Locally
              </button>
            )}
            {showLocalVerification && (
              <div className="mt-3">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ duration: 0.5 }}
                >
                  <ContractVerificationSteps address={checksummedAddress} />
                </motion.div>
              </div>
            )}
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
                            onClick={() => {
                              setSelected(k);
                              setSearchParams(
                                {
                                  ...Object.fromEntries(searchParams),
                                  source: k,
                                },
                                { replace: true },
                              );
                              setHighlightOffsets(null);
                            }}
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
                      <HighlightedSource
                        source={match.metadata.sources[selected].content}
                        langName={getLangName(match.metadata)}
                        decorations={sourceDecorations}
                      />
                    ) : (
                      <ContractFromRepo
                        checksummedAddress={checksummedAddress}
                        networkId={provider!._network.chainId}
                        filename={selected}
                        fileHash={match.metadata.sources[selected].keccak256}
                        type={match.type}
                        langName={getLangName(match.metadata)}
                        decorations={sourceDecorations}
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
