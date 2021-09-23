import React, { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { Tab } from "@headlessui/react";

type NavTabProps = {
  href: string;
};

// TODO: migrate activeClassName because of: https://github.com/remix-run/react-router/releases/tag/v5.3.0
// TODO: @types/react-router-dom still doesn't support function in className
const NavTab: React.FC<NavTabProps> = ({ href, children }) => (
  <Tab as={Fragment}>
    <NavLink
      className="text-gray-500 border-transparent hover:text-link-blue text-sm font-bold px-3 py-3 border-b-2"
      activeClassName="text-link-blue border-link-blue"
      to={href}
      exact
      replace
    >
      {children}
    </NavLink>
  </Tab>
);

export default NavTab;
