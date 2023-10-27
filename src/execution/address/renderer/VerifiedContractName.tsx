import { FC } from "react";
import { NavLink } from "react-router-dom";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";

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
  const contents = <>{resolvedName}</>;
  if (linkable) {
    return (
      <NavLink
        className={`flex items-baseline space-x-1 font-sans ${
          dontOverrideColors
            ? ""
            : "text-verified-purple hover:text-verified-purple-hover"
        } truncate`}
        to={`/address/${address}`}
        title={`Verified Contract (${resolvedName}): ${address}`}
      >
        {contents}
      </NavLink>
    );
  }

  return (
    <span className="truncate text-gray-400" title={name}>
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
