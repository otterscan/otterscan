import {
  ConstructorFragment,
  ErrorFragment,
  EventFragment,
  Fragment,
  FunctionFragment,
  Interface,
} from "ethers";
import { FC, memo } from "react";
import RawDecodedFragment from "./RawDecodedFragment";

type DecodedFragmentProps = {
  intf: Interface;
  fragment: Fragment;
  address?: string;
};

const DecodedFragment: FC<DecodedFragmentProps> = ({
  intf,
  fragment,
  address,
}) => {
  let fragmentType: "constructor" | "event" | "function" | "error" | undefined;
  let sig: string | undefined;
  let letter: string | undefined;
  let letterBg: string | undefined;
  let hashBg: string | undefined;

  if (FunctionFragment.isFunction(fragment)) {
    fragmentType = "function";
    sig = fragment.selector;
    letter = "F";
    letterBg = "bg-violet-500";
    hashBg = "bg-violet-50";
  } else if (EventFragment.isEvent(fragment)) {
    fragmentType = "event";
    sig = fragment.topicHash;
    letter = "E";
    letterBg = "bg-emerald-300";
    hashBg = "bg-emerald-50";
  } else if (ConstructorFragment.isConstructor(fragment)) {
    fragmentType = "constructor";
    letter = "C";
    letterBg = "bg-blue-500";
  } else if (ErrorFragment.isError(fragment)) {
    fragmentType = "error";
    sig = fragment.selector;
    letter = "E";
    letterBg = "bg-red-500";
    hashBg = "bg-red-50";
  }

  return (
    <RawDecodedFragment
      fragmentType={fragmentType}
      fragmentStr={fragment.format("full")}
      sig={sig}
      letter={letter}
      letterBg={letterBg}
      hashBg={hashBg}
      address={address}
    />
  );
};

export default memo(DecodedFragment);
