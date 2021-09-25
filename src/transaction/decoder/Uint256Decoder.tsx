import React, { useState } from "react";
import { hexlify } from "@ethersproject/bytes";
import { commify, formatEther } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";

type Uint256DecoderProps = {
  r: any;
};

enum DisplayMode {
  RAW,
  HEX,
  EIGHTEEN_DECIMALS,
}

const Uint256Decoder: React.FC<Uint256DecoderProps> = ({ r }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    DisplayMode.EIGHTEEN_DECIMALS
  );

  const toggleModes = () => {
    setDisplayMode(
      displayMode === DisplayMode.EIGHTEEN_DECIMALS ? 0 : displayMode + 1
    );
  };

  return (
    <div className="flex items-baseline space-x-2">
      <button
        className="flex items-baseline space-x-2 rounded-lg bg-gray-50 text-gray-300 hover:text-gray-500 font-sans text-xs px-3 py-1 min-w-max"
        onClick={toggleModes}
      >
        <div>
          <FontAwesomeIcon icon={faSync} size="1x" />
        </div>
        <span>
          {displayMode === DisplayMode.RAW
            ? "Raw number"
            : displayMode === DisplayMode.HEX
            ? "Hex number"
            : "18 decimals"}
        </span>
      </button>
      <span>
        {displayMode === DisplayMode.RAW ? (
          <>{commify(r.toString())}</>
        ) : displayMode === DisplayMode.HEX ? (
          <>{hexlify(r)}</>
        ) : (
          <>{commify(formatEther(r))}</>
        )}
      </span>
    </div>
  );
};

export default React.memo(Uint256Decoder);
