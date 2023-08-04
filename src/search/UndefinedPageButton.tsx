import React, { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

type UndefinedPageButtonProps = {
  address: string;
  direction: "first" | "last" | "prev" | "next";
  hash?: string;
  disabled?: boolean;
};

const UndefinedPageButton: React.FC<
  PropsWithChildren<UndefinedPageButtonProps>
> = ({ address, direction, hash, disabled, children }) => {
  if (disabled) {
    return (
      <span className="select-none rounded-lg bg-link-blue/10 px-3 py-2 text-xs text-gray-400">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      className="select-none rounded-lg bg-link-blue/10 px-3 py-2 text-xs text-link-blue transition-colors hover:bg-link-blue/100 hover:text-white disabled:cursor-default disabled:bg-link-blue disabled:text-gray-400"
      to={`/address/${address}/txs/${direction}${
        direction === "prev" || direction === "next" ? `?h=${hash}` : ""
      }`}
    >
      {children}
    </NavLink>
  );
};

export default UndefinedPageButton;
