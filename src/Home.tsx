import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, lazy, memo, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import Timestamp from "./components/Timestamp";
import { useGenericSearch } from "./search/search";
import { blockURL, slotURL } from "./url";
import { useFinalizedSlotNumber, useSlotTimestamp } from "./useConsensus";
import { useLatestBlockHeader } from "./useLatestBlock";
import { RuntimeContext } from "./useRuntime";
import { usePageTitle } from "./useTitle";
import { commify } from "./utils/utils";

const CameraScanner = lazy(() => import("./search/CameraScanner"));

const Home: FC = () => {
  const { provider, config } = useContext(RuntimeContext);
  const [searchRef, handleChange, handleSubmit] = useGenericSearch();

  const latestBlock = useLatestBlockHeader(provider);
  const finalizedSlotNumber = useFinalizedSlotNumber();
  const slotTime = useSlotTimestamp(finalizedSlotNumber);
  const [isScanning, setScanning] = useState<boolean>(false);

  usePageTitle("Home");

  return (
    <div className="flex grow flex-col items-center pb-5">
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <div className="mb-10 mt-5 flex max-h-64 grow items-end">
        <Logo />
      </div>
      <form
        className="flex min-w-[24rem] w-1/3 flex-col"
        onSubmit={handleSubmit}
        autoComplete="off"
        spellCheck={false}
      >
        <div className="mb-10 flex">
          <input
            className="w-full rounded-l border-b border-l border-t px-2 py-1 focus:outline-none"
            type="text"
            size={50}
            placeholder={`Search by address / txn hash / block number${
              provider?._network.getPlugin("org.ethers.plugins.network.Ens") !==
              null
                ? " / ENS name"
                : ""
            }`}
            onChange={handleChange}
            ref={searchRef}
            autoFocus
          />
          <button
            className="flex items-center justify-center rounded-r border bg-skin-button-fill px-2 py-1 text-base text-skin-button hover:bg-skin-button-hover-fill focus:outline-none"
            type="button"
            onClick={() => setScanning(true)}
            title="Scan an ETH address using your camera"
          >
            <FontAwesomeIcon icon={faQrcode} />
          </button>
        </div>
        <button
          className="mx-auto mb-10 rounded bg-skin-button-fill px-3 py-1 hover:bg-skin-button-hover-fill focus:outline-none"
          type="submit"
        >
          Search
        </button>
      </form>
      {!(config?.branding?.hideAnnouncements ?? false) &&
        config?.experimental && (
          <NavLink
            className="text-md font-bold text-green-600 hover:text-green-800"
            to="contracts/all"
          >
            🧪 EXPERIMENTAL CONTRACT BROWSER 🧪
          </NavLink>
        )}
      {latestBlock && (
        <NavLink
          className="mt-5 flex flex-col items-center space-y-1 text-sm text-gray-500 hover:text-link-blue"
          to={blockURL(latestBlock.number)}
        >
          <div>Latest block: {commify(latestBlock.number)}</div>
          <Timestamp value={latestBlock.timestamp} />
        </NavLink>
      )}
      {finalizedSlotNumber !== undefined && (
        <NavLink
          className="mt-5 flex flex-col items-center space-y-1 text-sm text-gray-500 hover:text-link-blue"
          to={slotURL(finalizedSlotNumber)}
        >
          <div>Finalized slot: {commify(finalizedSlotNumber)}</div>
          {slotTime && <Timestamp value={slotTime} />}
        </NavLink>
      )}
    </div>
  );
};

export default memo(Home);
