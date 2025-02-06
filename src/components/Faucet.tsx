import { faFaucetDrip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";
import { NavLink } from "react-router";
import { AddressAwareComponentProps } from "../execution/types";

type FaucetProps = AddressAwareComponentProps & {
  rounded?: boolean;
};

const Faucet: FC<FaucetProps> = ({ address, rounded }) => (
  <NavLink
    className={`flex-no-wrap flex items-center justify-center space-x-1 self-center text-gray-500 focus:outline-hidden ${
      rounded
        ? "transition-shadows h-7 w-7 rounded-full bg-gray-200 text-xs transition-colors hover:bg-gray-500 hover:text-gray-200 hover:shadow-sm"
        : "text-sm"
    }`}
    to={`/faucets?address=${address}`}
    title="Click to go to faucets page"
  >
    <FontAwesomeIcon icon={faFaucetDrip} size="1x" />
  </NavLink>
);

export default memo(Faucet);
