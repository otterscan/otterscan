import { Metadata } from "@ethereum-sourcify/lib-sourcify";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useContext, useEffect, useState } from "react";
import { NavLink } from "react-router";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";
import { useSourcifyMetadata } from "../../../sourcify/useSourcify";
import CheckedContractStorage from "../../../storage/CheckedContractStorage";
import { RuntimeContext } from "../../../useRuntime";

type VerifiedContractNameProps = {
  chainId: bigint;
  address: string;
  linkable: boolean;
  resolvedName: string;
  dontOverrideColors?: boolean;
};

const VerifiedContractName: FC<VerifiedContractNameProps> = ({
  chainId,
  address,
  linkable,
  resolvedName,
  dontOverrideColors,
}) => {
  const { provider } = useContext(RuntimeContext);
  const match = useSourcifyMetadata(address, provider._network.chainId);
  const [locallyVerified, setLocallyVerified] = useState<boolean>(false);

  useEffect(() => {
    // Check whether we locally verified this contract
    if (match) {
      const savedMetadataHash = CheckedContractStorage.get(chainId, address);
      if (savedMetadataHash !== null) {
        // TODO: Find reason our Metadata type is not compatible with Sourcify's
        CheckedContractStorage.hashMetadata(
          match.metadata as unknown as Metadata,
        ).then((metadataHash) => {
          if (metadataHash === savedMetadataHash) {
            setLocallyVerified(true);
          }
        });
      }
    }
  }, [match]);

  const contents = (
    <>
      {resolvedName}
      {locallyVerified ? (
        <FontAwesomeIcon
          className="ml-1 self-center text-emerald-500"
          icon={faCheckCircle}
        />
      ) : null}
    </>
  );
  const title = `Verified Contract (${resolvedName}): ${address}`;
  if (linkable) {
    return (
      <NavLink
        className={`flex items-baseline space-x-1 font-sans ${
          dontOverrideColors
            ? ""
            : "text-verified-contract hover:text-verified-contract-hover"
        } truncate`}
        to={`/address/${address}`}
        title={title}
      >
        {contents}
      </NavLink>
    );
  }

  return (
    <span className="truncate text-gray-400" title={title}>
      {contents}
    </span>
  );
};

export const VerifiedContractRenderer: ResolvedAddressRenderer<string> = (
  chainId,
  address,
  resolvedName,
  linkable,
  dontOverrideColors,
) => (
  <VerifiedContractName
    chainId={chainId}
    address={address}
    linkable={linkable}
    resolvedName={resolvedName}
    dontOverrideColors={dontOverrideColors}
  />
);

export default VerifiedContractName;
