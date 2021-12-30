import { NavLink } from "react-router-dom";
import { transactionURL } from "../url";

// TODO: extract common component with block/NavButton
type NavButtonProps = {
  txHash: string | null | undefined;
  disabled?: boolean;
};

const NavButton: React.FC<NavButtonProps> = ({
  txHash,
  disabled,
  children,
}) => {
  if (disabled || txHash === null || txHash === undefined) {
    return (
      <span className="bg-link-blue bg-opacity-10 text-gray-300 rounded px-2 py-1 text-xs">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      className="bg-link-blue bg-opacity-10 text-link-blue hover:bg-opacity-100 hover:text-white rounded px-2 py-1 text-xs"
      to={transactionURL(txHash)}
    >
      {children}
    </NavLink>
  );
};

export default NavButton;
