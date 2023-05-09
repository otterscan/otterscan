import { useState, useContext, memo, lazy, FC } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import PriceBox from "./PriceBox";
import SourcifyMenu from "./SourcifyMenu";
import { RuntimeContext } from "./useRuntime";
import { useGenericSearch } from "./search/search";
// @ts-expect-error
import Otter from "./otter.png?w=64&h=64&webp";

const CameraScanner = lazy(() => import("./search/CameraScanner"));

const Header: FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [searchRef, handleChange, handleSubmit] = useGenericSearch();
  const [isScanning, setScanning] = useState<boolean>(false);

  return (
    <>
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <div className="flex items-baseline justify-between px-9 py-2">
        <Link className="self-center" to="/">
          <div className="flex items-center space-x-2 font-title text-2xl font-bold text-link-blue">
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
              className="w-full rounded-l border-t border-b border-l px-2 py-1 text-sm focus:outline-none"
              type="text"
              size={60}
              placeholder={`Type "/" to search by address / txn hash / block number${
                provider?.network.ensAddress ? " / ENS name" : ""
              }`}
              onChange={handleChange}
              ref={searchRef}
            />
            <button
              className="border bg-skin-button-fill px-2 py-1 text-sm text-skin-button hover:bg-skin-button-hover-fill focus:outline-none"
              type="button"
              onClick={() => setScanning(true)}
              title="Scan an ETH address using your camera"
            >
              <FontAwesomeIcon icon={faQrcode} />
            </button>
            <button
              className="rounded-r border-t border-b border-r bg-skin-button-fill px-2 py-1 text-sm text-skin-button hover:bg-skin-button-hover-fill focus:outline-none"
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
