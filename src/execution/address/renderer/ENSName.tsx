import { FC } from "react";
import { NavLink } from "react-router-dom";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";
import ENSLogo from "./ensLogo.svg";

type ENSNameProps = {
  name: string;
  address: string;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const ENSName: FC<ENSNameProps> = ({
  name,
  address,
  linkable,
  dontOverrideColors,
}) => {
  if (linkable) {
    return (
      <NavLink
        className={`flex items-baseline space-x-1 font-sans ${
          dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
        } truncate`}
        to={`/address/${name}`}
        title={`${name}: ${address}`}
      >
        <Content linkable={true} name={name} />
      </NavLink>
    );
  }

  return (
    <div
      className="flex items-baseline space-x-1 truncate font-sans text-gray-700"
      title={`${name}: ${address}`}
    >
      <Content linkable={false} name={name} />
    </div>
  );
};

type ContentProps = {
  linkable: boolean;
  name: string;
};

const Content: FC<ContentProps> = ({ linkable, name }) => (
  <>
    <img
      className={`self-center ${linkable ? "" : "grayscale"}`}
      src={ENSLogo}
      alt="ENS Logo"
      width={12}
      height={12}
    />
    <span className="truncate">{name}</span>
  </>
);

export const ensRenderer: ResolvedAddressRenderer<string> = (
  chainId,
  address,
  resolvedAddress,
  linkable,
  dontOverrideColors
) => (
  <ENSName
    address={address}
    name={resolvedAddress}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default ENSName;
