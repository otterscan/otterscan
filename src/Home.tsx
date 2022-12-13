import React, { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn } from "@fortawesome/free-solid-svg-icons";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import Logo from "./Logo";
import Timestamp from "./components/Timestamp";
import { RuntimeContext } from "./useRuntime";
import { useLatestBlockHeader } from "./useLatestBlock";
import { blockURL, slotURL } from "./url";
import { useGenericSearch } from "./search/search";
import { useFinalizedSlotNumber, useSlotTimestamp } from "./useConsensus";

const CameraScanner = React.lazy(() => import("./search/CameraScanner"));

const Home: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [searchRef, handleChange, handleSubmit] = useGenericSearch();

  const latestBlock = useLatestBlockHeader(provider);
  const finalizedSlotNumber = useFinalizedSlotNumber();
  const slotTime = useSlotTimestamp(finalizedSlotNumber);
  const [isScanning, setScanning] = useState<boolean>(false);

  document.title = "Home | Otterscan";

  return (
    <div className="flex flex-col items-center grow pb-5">
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <div className="grow mt-5 mb-10 max-h-64 flex items-end">
        <Logo />
      </div>
      <form
        className="flex flex-col w-1/3"
        onSubmit={handleSubmit}
        autoComplete="off"
        spellCheck={false}
      >
        <div className="flex mb-10">
          <input
            className="w-full border-l border-t border-b rounded-l focus:outline-none px-2 py-1"
            type="text"
            size={50}
            placeholder={`Search by address / txn hash / block number${
              provider?.network.ensAddress ? " / ENS name" : ""
            }`}
            onChange={handleChange}
            ref={searchRef}
            autoFocus
          />
          <button
            className="border rounded-r bg-skin-button-fill hover:bg-skin-button-hover-fill focus:outline-none px-2 py-1 text-base text-skin-button flex justify-center items-center"
            type="button"
            onClick={() => setScanning(true)}
            title="Scan an ETH address using your camera"
          >
            <FontAwesomeIcon icon={faQrcode} />
          </button>
        </div>
        <button
          className="mx-auto px-3 py-1 mb-10 rounded bg-skin-button-fill hover:bg-skin-button-hover-fill focus:outline-none"
          type="submit"
        >
          Search
        </button>
      </form>
      <div className="text-lg text-link-blue hover:text-link-blue-hover font-bold">
        {provider?.network.chainId !== 11155111 && (
          <NavLink to="/special/london">
            <div className="flex space-x-2 items-baseline text-orange-500 hover:text-orange-700 hover:underline">
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
          className="flex flex-col items-center space-y-1 mt-5 text-sm text-gray-500 hover:text-link-blue"
          to={blockURL(latestBlock.number)}
        >
          <div>Latest block: {commify(latestBlock.number)}</div>
          <Timestamp value={latestBlock.timestamp} />
        </NavLink>
      )}
      {finalizedSlotNumber !== undefined && (
        <NavLink
          className="flex flex-col items-center space-y-1 mt-5 text-sm text-gray-500 hover:text-link-blue"
          to={slotURL(finalizedSlotNumber)}
        >
          <div>Finalized slot: {commify(finalizedSlotNumber)}</div>
          {slotTime && <Timestamp value={slotTime} />}
        </NavLink>
      )}
    </div>
  );
};

export default React.memo(Home);
