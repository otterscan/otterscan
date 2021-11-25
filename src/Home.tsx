import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn } from "@fortawesome/free-solid-svg-icons/faBurn";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import Logo from "./Logo";
import Timestamp from "./components/Timestamp";
import { RuntimeContext } from "./useRuntime";
import { useLatestBlock } from "./useLatestBlock";
import { blockURL } from "./url";
import { search } from "./search/search";

const CameraScanner = React.lazy(() => import("./search/CameraScanner"));

const Home: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [searchString, setSearchString] = useState<string>("");
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchTerm = e.target.value.trim();
    setCanSubmit(searchTerm.length > 0);
    setSearchString(searchTerm);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    search(searchString, navigate);
  };

  const latestBlock = useLatestBlock(provider);
  const [isScanning, setScanning] = useState<boolean>(false);

  document.title = "Home | Otterscan";

  return (
    <div className="mx-auto flex flex-col flex-grow pb-5">
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <div className="m-5 mb-10 flex items-end flex-grow max-h-64">
        <Logo />
      </div>
      <form
        className="flex flex-col"
        onSubmit={handleSubmit}
        autoComplete="off"
        spellCheck={false}
      >
        <div className="flex mb-10">
          <input
            className="w-full border-l border-t border-b rounded-l focus:outline-none px-2 py-1"
            type="text"
            size={50}
            placeholder="Search by address / txn hash / block number / ENS name"
            onChange={handleChange}
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
      <div className="mx-auto h-32">
        <div className="text-lg text-link-blue hover:text-link-blue-hover font-bold">
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
      </div>
    </div>
  );
};

export default React.memo(Home);
