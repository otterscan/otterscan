import { FC, memo } from "react";
import {
  ConstructorFragment,
  EventFragment,
  Fragment,
  FunctionFragment,
  Interface,
} from "@ethersproject/abi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";

type DecodedFragmentProps = {
  intf: Interface;
  fragment: Fragment;
};

const DecodedFragment: FC<DecodedFragmentProps> = ({ intf, fragment }) => {
  let fragmentType: "constructor" | "event" | "function" | undefined;
  let sig: string | undefined;
  let letter: string | undefined;
  let letterBg: string | undefined;
  let hashBg: string | undefined;

  if (FunctionFragment.isFunctionFragment(fragment)) {
    fragmentType = "function";
    sig = intf.getSighash(fragment);
    letter = "F";
    letterBg = "bg-violet-500";
    hashBg = "bg-violet-50";
  } else if (EventFragment.isEventFragment(fragment)) {
    fragmentType = "event";
    sig = intf.getEventTopic(fragment);
    letter = "E";
    letterBg = "bg-emerald-300";
    hashBg = "bg-emerald-50";
  } else if (ConstructorFragment.isConstructorFragment(fragment)) {
    fragmentType = "constructor";
    letter = "C";
    letterBg = "bg-blue-500";
  }

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
      <span className="whitespace-nowrap font-code text-sm">
        {fragment.format("full")}
      </span>
      {sig && (
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
      )}
    </div>
  );
};

export default memo(DecodedFragment);
