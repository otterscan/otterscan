import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaucetDrip } from "@fortawesome/free-solid-svg-icons/faFaucetDrip";
import { ChecksummedAddress } from "../types";

type FaucetProps = {
  address: ChecksummedAddress;
  rounded?: boolean;
};

const Faucet: React.FC<FaucetProps> = ({ address, rounded }) => (
  <NavLink
    className={`self-center flex flex-no-wrap justify-center items-center space-x-1 text-gray-500 focus:outline-none ${
      rounded
        ? "transition-colors transition-shadows bg-gray-200 hover:bg-gray-500 hover:text-gray-200 hover:shadow w-7 h-7 rounded-full text-xs"
        : "text-sm"
    }`}
    to={`/faucets?address=${address}`}
    title="Click to go to faucets page"
  >
    <FontAwesomeIcon icon={faFaucetDrip} size="1x" />
  </NavLink>
);

export default React.memo(Faucet);
