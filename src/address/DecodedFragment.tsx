import React from "react";
import {
  ConstructorFragment,
  EventFragment,
  Fragment,
  FunctionFragment,
  Interface,
} from "@ethersproject/abi";

type DecodedFragmentProps = {
  intf: Interface;
  fragment: Fragment;
};

const DecodedFragment: React.FC<DecodedFragmentProps> = ({
  intf,
  fragment,
}) => {
  let sig: string | undefined;
  let letter: string | undefined;
  let letterBg: string | undefined;

  if (FunctionFragment.isFunctionFragment(fragment)) {
    sig = intf.getSighash(fragment);
    letter = "F";
    letterBg = "bg-purple-500";
  } else if (EventFragment.isEventFragment(fragment)) {
    sig = intf.getEventTopic(fragment);
    letter = "E";
    letterBg = "bg-green-300";
  } else if (ConstructorFragment.isConstructorFragment(fragment)) {
    letter = "C";
    letterBg = "bg-blue-500";
  }

  return (
    <div className="flex items-baseline space-x-1">
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
        <span className="text-xs border rounded-xl px-2 pt-1 font-code">
          {sig}
        </span>
      )}
    </div>
  );
};

export default React.memo(DecodedFragment);
