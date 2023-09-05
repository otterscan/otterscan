import { FC } from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { contractFilters } from "./filters";

type ContractFilterMenuProps = {
  title: string;
};

const ContractFilterMenu: FC<ContractFilterMenuProps> = ({ title }) => (
  <Menu>
    <Menu.Button>
      <div className="flex items-baseline space-x-2 hover:text-link-blue-hover">
        <span>{title}</span>
        <span className="self-center">
          <FontAwesomeIcon icon={faChevronDown} size="1x" />
        </span>
      </div>
    </Menu.Button>
    <Menu.Items
      className="absolute space-y-1 rounded border bg-white p-1 drop-shadow"
      as="div"
    >
      {contractFilters.map((f) => (
        <Menu.Item key={f.url}>
          {({ active }) => (
            <NavLink to={f.url} end>
              {({ isActive }) => (
                <div
                  className={`${active && !isActive ? "bg-gray-200" : ""} ${
                    isActive ? "opacity-40" : ""
                  } text-md rounded px-2 py-1 font-normal`}
                >
                  {f.label}
                </div>
              )}
            </NavLink>
          )}
        </Menu.Item>
      ))}
    </Menu.Items>
  </Menu>
);

export default ContractFilterMenu;
