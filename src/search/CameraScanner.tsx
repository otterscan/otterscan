import React from "react";
import { useHistory } from "react-router-dom";
import { isAddress } from "@ethersproject/address";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { OnResultFunction } from "@blackbox-vision/react-qr-reader/dist-types/types";
import { BarcodeFormat } from "@zxing/library";
import { Dialog } from "@headlessui/react";

type CameraScannerProps = {
  turnOffScan: () => void;
};

const CameraScanner: React.FC<CameraScannerProps> = ({ turnOffScan }) => {
  const history = useHistory();

  const evaluateScan: OnResultFunction = (result, error, codeReader) => {
    console.log("scan");
    if (!error && result?.getBarcodeFormat() === BarcodeFormat.QR_CODE) {
      const text = result.getText();
      console.log(`Scanned: ${text}`);
      if (!isAddress(text)) {
        console.warn("Not an ETH address");
        return;
      }

      history.push(`/search?q=${text}`);
      turnOffScan();
    }
  };

  return (
    <Dialog
      className="fixed z-10 inset-0 overflow-y-auto"
      open={true}
      onClose={turnOffScan}
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <Dialog.Title className="absolute top-0 w-full text-center bg-white text-lg">
          Point an ETH address QR code to camera
        </Dialog.Title>
        <div className="absolute inset-0 bg-transparent rounded min-w-max max-w-3xl w-full h-screen max-h-screen m-auto">
          <QrReader
            className="m-auto"
            constraints={{}}
            onResult={evaluateScan}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CameraScanner;
