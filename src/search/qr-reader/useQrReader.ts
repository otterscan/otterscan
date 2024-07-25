import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";
import { MutableRefObject, RefObject, useEffect, useRef } from "react";
import { isMediaDevicesSupported, isValidType } from "./utils";

export type OnResultFunction = (
  /**
   * The QR values extracted by Zxing
   */
  result?: Result | undefined | null,
  /**
   * The name of the exceptions thrown while reading the QR
   */
  error?: Error | undefined | null,
  /**
   * The instance of the QR browser reader
   */
  codeReader?: BrowserQRCodeReader,
) => void;

export type UseQrReaderHookProps = {
  /**
   * Media constraints object, to specify which camera and capabilities to use
   */
  constraints?: MediaTrackConstraints;
  /**
   * Callback for retrieving the result
   */
  onResult: OnResultFunction;
  /**
   * Property that represents the scan period
   */
  scanDelay?: number;
  /**
   * Property that represents the video element
   */
  videoRef: RefObject<HTMLVideoElement>;
};

export type UseQrReaderHook = (props: UseQrReaderHookProps) => void;

// TODO: add support for debug logs
export const useQrReader: UseQrReaderHook = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoRef,
}) => {
  const controlsRef: MutableRefObject<IScannerControls | null> = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts,
    });

    let isUnmounted = false;

    if (
      !isMediaDevicesSupported() &&
      isValidType(onResult, "onResult", "function")
    ) {
      const message =
        'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';

      onResult(null, new Error(message), codeReader);
    }
    if (isValidType(video, "constraints", "object")) {
      (async () => {
        // Checks if the component already unmounted
        await Promise.resolve();
        if (isUnmounted || videoRef.current === null) {
          return;
        }

        codeReader
          .decodeFromConstraints(
            { video },
            videoRef.current,
            (result, error) => {
              if (isValidType(onResult, "onResult", "function")) {
                onResult(result, error, codeReader);
              }
            },
          )
          .then((controls: IScannerControls) => {
            if (isUnmounted) {
              controls.stop();
            } else {
              controlsRef.current = controls;
            }
          })
          .catch((error: Error) => {
            if (isValidType(onResult, "onResult", "function")) {
              onResult(null, error, codeReader);
            }
            console.error("Failed: error =", error);
          });
      })();
    }

    return () => {
      isUnmounted = true;
      controlsRef.current?.stop();
    };
  }, [videoRef]);
};
