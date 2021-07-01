import React from "react";
import { NavLink } from "react-router-dom";

type PageButtonProps = {
  goToPage: number;
  disabled?: boolean;
};

const PageButton: React.FC<PageButtonProps> = ({
  goToPage,
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
      to={`?p=${goToPage}`}
    >
      {children}
    </NavLink>
  );
};

export default PageButton;
