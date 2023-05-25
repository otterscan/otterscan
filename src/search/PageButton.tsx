import { FC, PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

type PageButtonProps = {
  goToPage: number;
  disabled?: boolean;
};

const PageButton: FC<PropsWithChildren<PageButtonProps>> = ({
  goToPage,
  disabled,
  children,
}) => {
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
      to={`?p=${goToPage}`}
    >
      {children}
    </NavLink>
  );
};

export default PageButton;
