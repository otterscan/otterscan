import { NavLink } from "react-router-dom";
import { transactionURL } from "../url";

// TODO: extract common component with block/NavButton
type NavButtonProps = {
  txHash: string | undefined;
  disabled?: boolean;
};

const NavButton: React.FC<NavButtonProps> = ({
  txHash,
  disabled,
  children,
}) => {
  if (disabled || txHash === undefined) {
    return (
      <span className="bg-link-blue bg-opacity-10 text-gray-400 rounded px-2 py-1 text-xs">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      className="transition-colors bg-link-blue bg-opacity-10 text-link-blue hover:bg-opacity-100 hover:text-white disabled:bg-link-blue disabled:text-gray-400 disabled:cursor-default rounded px-2 py-1 text-xs"
      to={transactionURL(txHash)}
    >
      {children}
    </NavLink>
  );
};

export default NavButton;
