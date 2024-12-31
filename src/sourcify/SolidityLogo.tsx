import React from "react";
import SolidityIcon from "./solidity.svg";

const SolidityLogo: React.FC = () => (
  <img
    src={SolidityIcon}
    alt="Solidity logo"
    title="Solidity"
    className="inline-block align-top w-[1em] h-[1em] translate-y-0.5"
  />
);

export default SolidityLogo;
