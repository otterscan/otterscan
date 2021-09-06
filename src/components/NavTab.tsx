import React from "react";
import { NavLink } from "react-router-dom";

type NavTabProps = {
  href: string;
};

const NavTab: React.FC<NavTabProps> = ({ href, children }) => (
  <NavLink
    className="text-gray-500 border-transparent hover:text-link-blue text-sm font-bold px-3 py-3 border-b-2"
    activeClassName="text-link-blue border-link-blue"
    to={href}
    exact
    replace
  >
    {children}
  </NavLink>
);

export default NavTab;
