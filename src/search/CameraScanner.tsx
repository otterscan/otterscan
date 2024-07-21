import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { BarcodeFormat } from "@zxing/library";
import { isAddress } from "ethers";
import React, { useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { QrReader } from "./qr-reader/QrReader";
import { OnResultFunction } from "./qr-reader/useQrReader";

type CameraScannerProps = {
  turnOffScan: () => void;
};

const CameraScanner: React.FC<CameraScannerProps> = ({ turnOffScan }) => {
  const navigate = useNavigate();
  const [_, startTransition] = useTransition();

  const evaluateScan: OnResultFunction = (result, error, codeReader) => {
    console.log("scan");
    if (!error && result?.getBarcodeFormat() === BarcodeFormat.QR_CODE) {
      const text = result.getText();
      console.log(`Scanned: ${text}`);
      if (!isAddress(text)) {
        console.warn("Not an ETH address");
        return;
      }

      startTransition(() => {
        navigate(`/search?q=${text}`);
        turnOffScan();
      });
    }
  };

  return (
    <Dialog
      className="fixed inset-0 z-10 overflow-y-auto"
      open={true}
      onClose={turnOffScan}
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-30" />
        <DialogPanel>
          <DialogTitle className="absolute left-0 top-0 w-full bg-white text-center text-lg">
            Point an ETH address QR code to camera
          </DialogTitle>
          <div className="absolute inset-0 m-auto h-screen max-h-screen w-full min-w-max max-w-3xl rounded bg-transparent">
            <QrReader
              className="m-auto h-full"
              constraints={{}}
              onResult={evaluateScan}
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CameraScanner;
