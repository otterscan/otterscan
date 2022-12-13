import { useState, useContext, memo, lazy, FC } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import PriceBox from "./PriceBox";
import SourcifyMenu from "./SourcifyMenu";
import { RuntimeContext } from "./useRuntime";
import { useGenericSearch } from "./search/search";
import Otter from "./otter.jpg";

const CameraScanner = lazy(() => import("./search/CameraScanner"));

const Header: FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [searchRef, handleChange, handleSubmit] = useGenericSearch();
  const [isScanning, setScanning] = useState<boolean>(false);

  return (
    <>
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <div className="px-9 py-2 flex justify-between items-baseline">
        <Link className="self-center" to="/">
          <div className="text-2xl text-link-blue font-title font-bold flex items-center space-x-2">
            <img
              className="rounded-full"
              src={Otter}
              width={32}
              height={32}
              alt="An otter scanning"
              title="An otter scanning"
            />
            <span>Otterscan</span>
          </div>
        </Link>
        <div className="flex items-baseline space-x-3">
          {provider?.network.chainId === 1 && <PriceBox />}
          <form
            className="flex"
            onSubmit={handleSubmit}
            autoComplete="off"
            spellCheck={false}
          >
            <input
              className="w-full border-t border-b border-l rounded-l focus:outline-none px-2 py-1 text-sm"
              type="text"
              size={60}
              placeholder={`Type "/" to search by address / txn hash / block number${
                provider?.network.ensAddress ? " / ENS name" : ""
              }`}
              onChange={handleChange}
              ref={searchRef}
            />
            <button
              className="border bg-skin-button-fill hover:bg-skin-button-hover-fill focus:outline-none px-2 py-1 text-sm text-skin-button"
              type="button"
              onClick={() => setScanning(true)}
              title="Scan an ETH address using your camera"
            >
              <FontAwesomeIcon icon={faQrcode} />
            </button>
            <button
              className="rounded-r border-t border-b border-r bg-skin-button-fill hover:bg-skin-button-hover-fill focus:outline-none px-2 py-1 text-sm text-skin-button"
              type="submit"
            >
              Search
            </button>
          </form>
          <SourcifyMenu />
        </div>
      </div>
    </>
  );
};

export default memo(Header);
