import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { lazy } from "react";
import { MatchType, useContract } from "../../sourcify/useSourcify";
import { useAppConfigContext } from "../../useAppConfig";

const HighlightedSolidity = lazy(
  () => import("./contract/HighlightedSolidity"),
);

type ContractFromRepoProps = {
  checksummedAddress: string;
  networkId: bigint;
  filename: string;
  type: MatchType;
};

const ContractFromRepo: React.FC<ContractFromRepoProps> = ({
  checksummedAddress,
  networkId,
  filename,
  type,
}) => {
  const { sourcifySource } = useAppConfigContext();
  const content = useContract(
    checksummedAddress,
    networkId,
    filename,
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
      {content !== undefined && <HighlightedSolidity source={content} />}
    </>
  );
};

export default React.memo(ContractFromRepo);
