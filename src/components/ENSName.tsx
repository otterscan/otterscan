import React from "react";
import { NavLink } from "react-router-dom";
import ENSLogo from "./ensLogo.svg";

type ENSNameProps = {
  name: string;
  address: string;
  text: string | undefined;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const ENSName: React.FC<ENSNameProps> = ({
  name,
  address,
  text,
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
      className="flex items-baseline space-x-1 font-sans text-gray-700 truncate"
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

const Content: React.FC<ContentProps> = ({ linkable, name }) => (
  <>
    <img
      className={`self-center ${linkable ? "" : "filter grayscale"}`}
      src={ENSLogo}
      alt="ENS Logo"
      width={12}
      height={12}
    />
    <span className="truncate">{name}</span>
  </>
);

export default ENSName;
