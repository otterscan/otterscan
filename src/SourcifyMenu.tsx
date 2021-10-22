import React from "react";
import { Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { SourcifySource } from "./url";
import { useAppConfigContext } from "./useAppConfig";

const SourcifyMenu: React.FC = () => {
  const { sourcifySource, setSourcifySource } = useAppConfigContext();

  return (
    <Menu>
      <div className="relative self-stretch">
        <Menu.Button className="w-full h-full flex justify-center items-center space-x-2 text-sm border rounded px-2 py-1">
          <FontAwesomeIcon icon={faBars} size="1x" />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-1 border p-1 rounded-b bg-white flex flex-col text-sm min-w-max">
          <div className="px-2 py-1 text-xs border-b border-gray-300">
            Sourcify Datasource
          </div>
          <SourcifyMenuItem
            checked={sourcifySource === SourcifySource.IPFS_IPNS}
            onClick={() => setSourcifySource(SourcifySource.IPFS_IPNS)}
          >
            Resolve IPNS
          </SourcifyMenuItem>
          <SourcifyMenuItem
            checked={sourcifySource === SourcifySource.CENTRAL_SERVER}
            onClick={() => setSourcifySource(SourcifySource.CENTRAL_SERVER)}
          >
            Sourcify Servers
          </SourcifyMenuItem>
        </Menu.Items>
      </div>
    </Menu>
  );
};

type SourcifyMenuItemProps = {
  checked?: boolean;
  onClick: () => void;
};

const SourcifyMenuItem: React.FC<SourcifyMenuItemProps> = ({
  checked = false,
  onClick,
  children,
}) => (
  <Menu.Item>
    {({ active }) => (
      <button
        className={`text-sm text-left px-2 py-1 ${
          active ? "border-orange-200 text-gray-500" : "text-gray-400"
        } transition-transform transition-colors duration-75 ${
          checked ? "text-gray-900" : ""
        }`}
        onClick={onClick}
      >
        {children}
      </button>
    )}
  </Menu.Item>
);

export default React.memo(SourcifyMenu);
