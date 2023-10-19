import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "@headlessui/react";
import React, { PropsWithChildren } from "react";
import { SourcifySource } from "./sourcify/useSourcify";
import { useAppConfigContext } from "./useAppConfig";

const SourcifyMenu: React.FC = () => {
  const { sourcifySource, setSourcifySource } = useAppConfigContext();

  return (
    <Menu>
      <div className="relative self-stretch">
        <Menu.Button className="flex h-full w-full items-center justify-center space-x-2 rounded border px-2 py-1 text-sm">
          <FontAwesomeIcon icon={faBars} size="1x" />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-1 flex min-w-max flex-col rounded-b border bg-white p-1 text-sm">
          <div className="border-b border-gray-300 px-2 py-1 text-xs">
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

const SourcifyMenuItem: React.FC<PropsWithChildren<SourcifyMenuItemProps>> = ({
  checked = false,
  onClick,
  children,
}) => (
  <Menu.Item>
    {({ active }) => (
      <button
        className={`px-2 py-1 text-left text-sm ${
          active ? "border-orange-200 text-gray-500" : "text-gray-400"
        } transition-colors transition-transform duration-75 ${
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
