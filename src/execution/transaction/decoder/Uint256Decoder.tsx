import { FC, memo, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { hexlify, hexZeroPad } from "@ethersproject/bytes";
import { commify, formatEther } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

type Uint256DecoderProps = {
  r: any;
};

enum DisplayMode {
  RAW,
  EIGHTEEN_DECIMALS,
  HEX,
  _LAST,
}

const VERY_BIG_NUMBER = BigNumber.from(10).pow(BigNumber.from(36));

const initDisplayMode = (r: any): DisplayMode => {
  const n = BigNumber.from(r);
  if (n.gte(VERY_BIG_NUMBER)) {
    return DisplayMode.HEX;
  }
  return DisplayMode.RAW;
};

const Uint256Decoder: FC<Uint256DecoderProps> = ({ r }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    initDisplayMode(r)
  );

  const toggleModes = () => {
    const next = displayMode + 1;
    setDisplayMode(next === DisplayMode._LAST ? 0 : next);
  };

  return (
    <div className="flex items-baseline space-x-2 font-code">
      <button
        className="flex min-w-max items-baseline space-x-2 rounded-lg bg-gray-50 px-3 py-1 font-sans text-xs text-gray-300 hover:text-gray-500"
        onClick={toggleModes}
      >
        <div>
          <FontAwesomeIcon icon={faSync} size="1x" />
        </div>
        <span>
          {displayMode === DisplayMode.RAW
            ? "Raw"
            : displayMode === DisplayMode.HEX
            ? "Hex"
            : "18 dec"}
        </span>
      </button>
      <span>
        {displayMode === DisplayMode.RAW ? (
          <>{commify(r.toString())}</>
        ) : displayMode === DisplayMode.HEX ? (
          <>{hexZeroPad(hexlify(r), 32)}</>
        ) : (
          <>{commify(formatEther(r))}</>
        )}
      </span>
    </div>
  );
};

export default memo(Uint256Decoder);
