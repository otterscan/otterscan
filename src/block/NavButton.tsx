import { FC, PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { BlockTag } from "@ethersproject/abstract-provider";

type NavButtonProps = {
  blockNum: number;
  disabled?: boolean;
  urlBuilder: (blockNumber: BlockTag) => string;
};

const NavButton: FC<PropsWithChildren<NavButtonProps>> = ({
  blockNum,
  disabled,
  urlBuilder,
  children,
}) => {
  if (disabled) {
    return (
      <span className="rounded bg-link-blue/10 px-2 py-1 text-xs text-gray-400">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      className="rounded bg-link-blue/10 px-2 py-1 text-xs text-link-blue transition-colors hover:bg-link-blue/100 hover:text-white disabled:cursor-default disabled:bg-link-blue disabled:text-gray-400"
      to={urlBuilder(blockNum)}
    >
      {children}
    </NavLink>
  );
};

export default NavButton;
