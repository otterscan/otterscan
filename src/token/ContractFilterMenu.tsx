import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FC } from "react";
import { NavLink } from "react-router-dom";
import { contractFilters } from "./filters";

type ContractFilterMenuProps = {
  title: string;
};

const ContractFilterMenu: FC<ContractFilterMenuProps> = ({ title }) => (
  <Menu>
    <MenuButton>
      <div className="flex items-baseline space-x-2 hover:text-link-blue-hover">
        <span>{title}</span>
        <span className="self-center">
          <FontAwesomeIcon icon={faChevronDown} size="1x" />
        </span>
      </div>
    </MenuButton>
    <MenuItems
      className="absolute space-y-1 rounded border bg-white p-1 drop-shadow"
      as="div"
    >
      {contractFilters.map((f) => (
        <MenuItem key={f.url}>
          {({ focus }) => (
            <NavLink to={f.url} end>
              {({ isActive }) => (
                <div
                  className={`${focus && !isActive ? "bg-gray-200" : ""} ${
                    isActive ? "opacity-40" : ""
                  } text-md rounded px-2 py-1 font-normal`}
                >
                  {f.label}
                </div>
              )}
            </NavLink>
          )}
        </MenuItem>
      ))}
    </MenuItems>
  </Menu>
);

export default ContractFilterMenu;
