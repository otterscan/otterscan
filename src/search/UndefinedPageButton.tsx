import React from "react";
import { NavLink } from "react-router-dom";

type UndefinedPageButtonProps = {
  address: string;
  direction: "first" | "last" | "prev" | "next";
  hash?: string;
  disabled?: boolean;
};

const UndefinedPageButton: React.FC<UndefinedPageButtonProps> = ({
  address,
  direction,
  hash,
  disabled,
  children,
}) => {
  if (disabled) {
    return (
      <span className="bg-link-blue bg-opacity-10 text-gray-400 rounded-lg px-3 py-2 text-xs">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      className="transition-colors bg-link-blue bg-opacity-10 text-link-blue hover:bg-opacity-100 hover:text-white disabled:bg-link-blue disabled:text-gray-400 disabled:cursor-default rounded-lg px-3 py-2 text-xs"
      to={`/address/${address}/${direction}${
        direction === "prev" || direction === "next" ? `?h=${hash}` : ""
      }`}
    >
      {children}
    </NavLink>
  );
};

export default UndefinedPageButton;
