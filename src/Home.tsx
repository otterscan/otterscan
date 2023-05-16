import { useState, useContext, lazy, FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn, faQrcode } from "@fortawesome/free-solid-svg-icons";
import Logo from "./Logo";
import Timestamp from "./components/Timestamp";
import { RuntimeContext } from "./useRuntime";
import { useLatestBlockHeader } from "./useLatestBlock";
import { blockURL, slotURL } from "./url";
import { useGenericSearch } from "./search/search";
import SuggestionsDropdown from "./search/SuggestionsDropdown";
import { useFinalizedSlotNumber, useSlotTimestamp } from "./useConsensus";

const CameraScanner = lazy(() => import("./search/CameraScanner"));

const Home: FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [searchRef, handleChange, handleSubmit] = useGenericSearch();

  const latestBlock = useLatestBlockHeader(provider);
  const finalizedSlotNumber = useFinalizedSlotNumber();
  const slotTime = useSlotTimestamp(finalizedSlotNumber);
  const [isScanning, setScanning] = useState<boolean>(false);

  document.title = "Home | Otterscan";

  return (
    <div className="flex grow flex-col items-center pb-5">
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <div className="mb-10 mt-5 flex max-h-64 grow items-end">
        <Logo />
      </div>
      <form
        className="flex w-1/3 flex-col"
        onSubmit={handleSubmit}
        autoComplete="off"
        spellCheck={false}
      >
        <div className="mb-10 flex">
          <div className="dropdown">
            <input
              className="w-full rounded-l border-b border-l border-t px-2 py-1 focus:outline-none"
              type="text"
              size={50}
              placeholder={`Search by address / txn hash / block number${
                provider?.network.ensAddress ? " / ENS name" : ""
              }`}
              onChange={handleChange}
              ref={searchRef}
              autoFocus
            />
            <SuggestionsDropdown searchRef={searchRef} />
          </div>

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
      <div className="text-lg font-bold text-link-blue hover:text-link-blue-hover">
        {provider?.network.chainId !== 11155111 && (
          <NavLink to="/special/london">
            <div className="flex items-baseline space-x-2 text-orange-500 hover:text-orange-700 hover:underline">
              <span>
                <FontAwesomeIcon icon={faBurn} />
              </span>
              <span>Check out the special dashboard for EIP-1559</span>
              <span>
                <FontAwesomeIcon icon={faBurn} />
              </span>
            </div>
          </NavLink>
        )}
      </div>
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
