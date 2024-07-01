import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, JSX, memo } from "react";
import { NavLink } from "react-router-dom";

type RawDecodedFragmentProps = {
  fragmentType?: "constructor" | "event" | "function" | "error";
  fragmentStr?: JSX.Element | string;
  sig?: string;
  letter?: string;
  letterBg?: string;
  hashBg?: string;
  address?: string;
};

const RawDecodedFragment: FC<RawDecodedFragmentProps> = ({
  fragmentType,
  fragmentStr,
  sig,
  letter,
  letterBg,
  hashBg,
  address,
}) => {
  return (
    <div className="flex items-baseline space-x-2 px-2 py-1 hover:bg-gray-100">
      <span className="text-gray-500">
        <FontAwesomeIcon icon={faCaretRight} size="1x" />
      </span>
      {letter && (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center self-center rounded-full border border-gray-300 font-code text-xs font-bold text-white ${letterBg}`}
        >
          {letter}
        </span>
      )}
      {fragmentStr !== undefined && (
        <span className="whitespace-nowrap font-code text-sm">
          {fragmentStr}
        </span>
      )}
      {sig && (
        <>
          <span
            className={`rounded-xl border px-2 pt-1 font-code text-xs text-gray-600 ${hashBg}`}
            title={
              fragmentType === "function"
                ? "Method Selector"
                : fragmentType === "event"
                  ? "Topic Hash"
                  : ""
            }
          >
            {sig}
          </span>
          {address && fragmentType === "function" && (
            <NavLink to={`/address/${address}/readContract#${sig}`}>
              read &raquo;
            </NavLink>
          )}
        </>
      )}
    </div>
  );
};

export default memo(RawDecodedFragment);
