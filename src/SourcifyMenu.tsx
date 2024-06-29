import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import React, { PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggler from "./components/ThemeToggler";
import { SourcifySource } from "./sourcify/useSourcify";
import { useAppConfigContext } from "./useAppConfig";

const SourcifyMenu: React.FC = () => {
  const { sourcifySource, setSourcifySource } = useAppConfigContext() ?? {
    sourcifySource: null,
    setSourcifySource: (s: SourcifySource) => {},
  };
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Menu>
      <div className="relative self-stretch h-full">
        <MenuButton className="flex h-full w-full items-center justify-center space-x-2 rounded border px-2 py-1 text-sm">
          <FontAwesomeIcon icon={faBars} size="1x" />
        </MenuButton>
        <MenuItems className="absolute right-0 mt-1 flex min-w-max flex-col rounded-b border bg-white p-1 text-sm">
          {sourcifySource !== null && (
            <>
              <SourcifyMenuTitle>Sourcify Datasource</SourcifyMenuTitle>
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
              <div className="my-1 border-b border-gray-300" />
            </>
          )}
          <ThemeToggler />
          <div className="my-1 border-b border-gray-300" />
          <SourcifyMenuItem
            checked={location.pathname !== "/broadcastTx"}
            onClick={() => {
              navigate("/broadcastTx");
            }}
          >
            Broadcast Transaction
          </SourcifyMenuItem>
        </MenuItems>
      </div>
    </Menu>
  );
};

type SourcifyMenuItemProps = {
  checked?: boolean;
  onClick: (event?: any) => void;
};

export const SourcifyMenuItem: React.FC<
  PropsWithChildren<SourcifyMenuItemProps>
> = ({ checked = false, onClick, children }) => (
  <MenuItem>
    {({ focus }) => (
      <button
        className={`px-2 py-1 text-left text-sm ${
          focus ? "border-orange-200 text-gray-500" : "text-gray-400"
        } transition-colors transition-transform duration-75 ${
          checked ? "text-gray-900" : ""
        }`}
        onClick={onClick}
      >
        {children}
      </button>
    )}
  </MenuItem>
);

export const SourcifyMenuTitle: React.FC<PropsWithChildren> = ({
  children,
}) => (
  <div className="border-b border-gray-300 px-2 py-1 text-xs select-none">
    {children}
  </div>
);

export default React.memo(SourcifyMenu);
