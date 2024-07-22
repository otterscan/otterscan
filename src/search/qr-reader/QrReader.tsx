import { OnResultFunction, useQrReader } from "./useQrReader";

export type QrReaderProps = {
  /**
   * Media track constraints object, to specify which camera and capabilities to use
   */
  constraints: MediaTrackConstraints;
  /**
   * Called when an error occurs.
   */
  onResult: OnResultFunction;
  /**
   * Property that represents the view finder component
   */
  ViewFinder?: (props: any) => React.ReactElement<any, any> | null;
  /**
   * Property that represents the scan period
   */
  scanDelay?: number;
  /**
   * Property that represents the ID of the video element
   */
  videoId?: string;
  /**
   * Property that represents an optional className to modify styles
   */
  className?: string;
  /**
   * Property that represents a style for the container
   */
  containerStyle?: any;
  /**
   * Property that represents a style for the video
   */
  videoStyle?: any;
};

export const QrReader: React.FC<QrReaderProps> = ({
  videoStyle,
  constraints = {
    facingMode: "user",
  },
  ViewFinder,
  scanDelay = 500,
  className,
  onResult = () => {},
  videoId = "video",
}) => {
  useQrReader({
    constraints,
    scanDelay,
    onResult,
    videoId,
  });

  return (
    <section className={className}>
      <div className="w-full h-full pt-full overflow-hidden relative">
        {!!ViewFinder && <ViewFinder />}
        <video
          muted
          id={videoId}
          className={`top-0 left-0 w-full h-full block overflow-hidden absolute ${constraints?.facingMode === "user" ? "scale-x-[-1]" : ""}`}
        />
      </div>
    </section>
  );
};

export default QrReader;
