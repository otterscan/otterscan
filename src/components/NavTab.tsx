import { Tab } from "@headlessui/react";
import React, { Fragment, PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

type NavTabProps = {
  href: string;
};

const NavTab: React.FC<PropsWithChildren<NavTabProps>> = ({
  href,
  children,
}) => (
  <Tab as={Fragment}>
    <NavLink
      className={({ isActive }) =>
        `${
          isActive
            ? "border-link-blue text-link-blue"
            : "border-transparent text-gray-500"
        } border-b-2 px-3 py-3 text-sm font-bold hover:text-link-blue`
      }
      to={href}
      end
      replace
    >
      {children}
    </NavLink>
  </Tab>
);

export default NavTab;
