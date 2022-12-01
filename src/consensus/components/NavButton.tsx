import { FC, PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

type NavButtonProps = {
  entityNum: number;
  disabled?: boolean;
  urlBuilder: (entityNum: number) => string;
};

const NavButton: FC<PropsWithChildren<NavButtonProps>> = ({
  entityNum,
  disabled,
  urlBuilder,
  children,
}) => {
  if (disabled) {
    return (
      <span className="bg-link-blue/10 text-gray-400 rounded px-2 py-1 text-xs">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      className="transition-colors bg-link-blue/10 text-link-blue hover:bg-link-blue/100 hover:text-white disabled:bg-link-blue disabled:text-gray-400 disabled:cursor-default rounded px-2 py-1 text-xs"
      to={urlBuilder(entityNum)}
    >
      {children}
    </NavLink>
  );
};

export default NavButton;
