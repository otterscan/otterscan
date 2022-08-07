import { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { ChecksummedAddress } from "../types";
import { addressByNonceURL } from "../url";

// TODO: extract common component with block/NavButton
type NavButtonProps = {
  sender: ChecksummedAddress;
  nonce: number;
  disabled?: boolean;
};

const NavButton: React.FC<PropsWithChildren<NavButtonProps>> = ({
  sender,
  nonce,
  disabled,
  children,
}) => {
  if (disabled) {
    return (
      <span className="bg-link-blue bg-opacity-10 text-gray-300 rounded px-2 py-1 text-xs">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      className="bg-link-blue bg-opacity-10 text-link-blue hover:bg-opacity-100 hover:text-white rounded px-2 py-1 text-xs"
      to={addressByNonceURL(sender, nonce)}
    >
      {children}
    </NavLink>
  );
};

export default NavButton;
