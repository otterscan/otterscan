import React, { useState, useRef, useContext } from "react";
import { isAddress } from "@ethersproject/address";
import { Link, useHistory } from "react-router-dom";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { OnResultFunction } from "@blackbox-vision/react-qr-reader/dist-types/types";
import { BarcodeFormat } from "@zxing/library";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import useKeyboardShortcut from "use-keyboard-shortcut";
import PriceBox from "./PriceBox";
import { RuntimeContext } from "./useRuntime";

const Title: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [search, setSearch] = useState<string>();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const history = useHistory();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCanSubmit(e.target.value.trim().length > 0);
    setSearch(e.target.value.trim());
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    history.push(`/search?q=${search}`);
  };

  const searchRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcut(["/"], () => {
    searchRef.current?.focus();
  });

  const [isScanning, setScanning] = useState<boolean>();
  const onScan = () => {
    setScanning(!isScanning);
  };
  const evaluateScan: OnResultFunction = (result, error, codeReader) => {
    console.log("scan");
    if (!error && result?.getBarcodeFormat() === BarcodeFormat.QR_CODE) {
      const text = result.getText();
      console.log(`Scanned: ${text}`);
      if (!isAddress(text)) {
        console.log("Not an ETH address");
        return;
      }

      if (searchRef.current) {
        searchRef.current.value = text;
        searchRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      }
      setScanning(false);
    }
  };

  return (
    <div className="px-9 py-2 flex justify-between items-baseline">
      <Link className="self-center" to="/">
        <div className="text-2xl text-link-blue font-title font-bold flex items-center space-x-2">
          <img
            className="rounded-full"
            src="/otter.jpg"
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
            placeholder='Type "/" to search by address / txn hash / block number / ENS name'
            onChange={handleChange}
            ref={searchRef}
          />
          <button
            className="border bg-gray-100 hover:bg-gray-200 focus:outline-none px-2 py-1 text-sm text-gray-500"
            type="button"
            onClick={onScan}
          >
            <FontAwesomeIcon icon={faQrcode} />
          </button>
          {isScanning && (
            <QrReader
              className="w-screen h-screen"
              constraints={{}}
              onResult={evaluateScan}
            />
          )}
          <button
            className="rounded-r border-t border-b border-r bg-gray-100 hover:bg-gray-200 focus:outline-none px-2 py-1 text-sm text-gray-500"
            type="submit"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(Title);
