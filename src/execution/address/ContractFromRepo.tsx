import { faCircleNotch, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { DecorationOptions } from "shiki";
import Alert from "../../components/Alert";
import { MatchType, useContract } from "../../sourcify/useSourcify";
import { useAppConfigContext } from "../../useAppConfig";
import HighlightedSource from "./contract/HighlightedSource";

type ContractFromRepoProps = {
  checksummedAddress: string;
  networkId: bigint;
  filename: string;
  fileHash: string;
  type: MatchType;
  langName: string;
  decorations?: DecorationOptions["decorations"];
};

const ContractFromRepo: React.FC<ContractFromRepoProps> = ({
  checksummedAddress,
  networkId,
  filename,
  fileHash,
  type,
  langName,
  decorations,
}) => {
  const { sourcifySource } = useAppConfigContext();
  const { source: content, failedHashCheck } = useContract(
    checksummedAddress,
    networkId,
    filename,
    fileHash,
    sourcifySource,
    type,
  );

  return (
    <>
      {content === undefined && (
        <div className="flex h-80 w-full flex-col justify-center border text-center text-gray-500">
          <span>
            <FontAwesomeIcon
              className="animate-spin"
              icon={faCircleNotch}
              size="2x"
            />
          </span>
        </div>
      )}
      {content !== undefined && (
        <>
          {failedHashCheck && (
            <Alert
              className="bg-red-100 border-red-500 text-red-700"
              margin=""
              icon={faWarning}
            >
              This source might be incorrect and should not be trusted. Its hash
              does not match the hash found in the contract metadata.
            </Alert>
          )}
          <HighlightedSource
            source={content}
            langName={langName}
            decorations={decorations}
          />
        </>
      )}
    </>
  );
};

export default React.memo(ContractFromRepo);
