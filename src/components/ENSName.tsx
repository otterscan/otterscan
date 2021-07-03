import React from "react";
import ENSLogo from "./ensLogo.svg";

type ENSNameProps = {
  name: string;
  address: string;
};

const ENSName: React.FC<ENSNameProps> = ({ name, address }) => (
  <div
    className="flex items-baseline space-x-1 font-sans text-gray-700 truncate"
    title={`${name}: ${address}`}
  >
    <img
      className="self-center filter grayscale"
      src={ENSLogo}
      alt="ENS Logo"
      width={12}
      height={12}
    />
    <p className="truncate">{name}</p>
  </div>
);

export default React.memo(ENSName);
