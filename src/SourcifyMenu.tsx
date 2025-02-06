import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import React, { PropsWithChildren, useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import ExternalLink from "./components/ExternalLink";
import ThemeToggler from "./components/ThemeToggler";
import {
  resolveSourcifySource,
  SourcifySource,
  useSourcifySources,
} from "./sourcify/useSourcify";
import { useAppConfigContext } from "./useAppConfig";
import { RuntimeContext } from "./useRuntime";

const SourcifyMenu: React.FC = () => {
  const { config } = useContext(RuntimeContext);
  const sourcifySources = useSourcifySources();
  const { sourcifySource: selectedSourcifySource, setSourcifySource } =
    useAppConfigContext() ?? {
      sourcifySource: null,
      setSourcifySource: (s: SourcifySource) => {},
    };
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Menu>
      <div className="relative self-stretch h-full z-1">
        <MenuButton className="flex h-full w-full items-center justify-center space-x-2 rounded-sm border px-2 py-1 text-sm">
          <FontAwesomeIcon icon={faBars} size="1x" />
        </MenuButton>
        <MenuItems className="absolute right-0 mt-1 flex min-w-max flex-col rounded-b border bg-white p-1 text-sm">
          {sourcifySources && (
            <>
              <SourcifyMenuTitle>Sourcify Datasource</SourcifyMenuTitle>
              {Object.entries(sourcifySources).map(
                ([sourcifySourceName, sourcifySource], index) => (
                  <React.Fragment key={sourcifySourceName}>
                    <SourcifyMenuItem
                      checked={
                        selectedSourcifySource === sourcifySourceName ||
                        (selectedSourcifySource === null &&
                          resolveSourcifySource(
                            selectedSourcifySource,
                            sourcifySources,
                          ).name === sourcifySourceName)
                      }
                      onClick={() => setSourcifySource(sourcifySourceName)}
                    >
                      {sourcifySourceName}
                    </SourcifyMenuItem>
                  </React.Fragment>
                ),
              )}
              {config.sourcify?.sources === undefined &&
                !config.branding?.hideAnnouncements && (
                  <div className="px-2 py-1 text-left text-sm">
                    <ExternalLink href="https://docs.otterscan.io/config/options/sourcify">
                      Add local sources
                    </ExternalLink>
                  </div>
                )}
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
