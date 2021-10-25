import React from "react";
import {
  ConstructorFragment,
  EventFragment,
  Fragment,
  FunctionFragment,
  Interface,
} from "@ethersproject/abi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons/faCaretRight";

type DecodedFragmentProps = {
  intf: Interface;
  fragment: Fragment;
};

const DecodedFragment: React.FC<DecodedFragmentProps> = ({
  intf,
  fragment,
}) => {
  let fragmentType: "constructor" | "event" | "function" | undefined;
  let sig: string | undefined;
  let letter: string | undefined;
  let letterBg: string | undefined;
  let hashBg: string | undefined;

  if (FunctionFragment.isFunctionFragment(fragment)) {
    fragmentType = "function";
    sig = intf.getSighash(fragment);
    letter = "F";
    letterBg = "bg-purple-500";
    hashBg = "bg-purple-50";
  } else if (EventFragment.isEventFragment(fragment)) {
    fragmentType = "event";
    sig = intf.getEventTopic(fragment);
    letter = "E";
    letterBg = "bg-green-300";
    hashBg = "bg-green-50";
  } else if (ConstructorFragment.isConstructorFragment(fragment)) {
    fragmentType = "constructor";
    letter = "C";
    letterBg = "bg-blue-500";
  }

  return (
    <div className="flex flex-wrap items-baseline space-x-2 px-2 py-1 hover:bg-gray-100">
      <span className="text-gray-500">
        <FontAwesomeIcon icon={faCaretRight} size="1x" />
      </span>
      {letter && (
        <span
          className={`flex-shrink-0 text-xs font-code border border-gray-300 rounded-full w-5 h-5 self-center flex items-center justify-center text-white font-bold ${letterBg}`}
        >
          {letter}
        </span>
      )}
      <span className="text-sm font-code whitespace-nowrap">
        {fragment.format("full")}
      </span>
      {sig && (
        <span
          className={`text-xs border rounded-xl px-2 pt-1 font-code text-gray-600 ${hashBg}`}
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

export default React.memo(DecodedFragment);
