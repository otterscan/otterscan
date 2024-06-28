import { Interface } from "ethers";
import { FC, memo } from "react";
import { ABIAwareComponentProps } from "../../types";
import DecodedFragment from "./DecodedFragment";
import RawDecodedFragment from "./RawDecodedFragment";

const DecodedABI: FC<ABIAwareComponentProps> = ({ abi, unknownSelectors }) => {
  const intf = new Interface(abi);
  return (
    <div className="overflow-x-auto border">
      {intf.fragments.map((f, i) => (
        <DecodedFragment key={i} intf={intf} fragment={f} />
      ))}
      {unknownSelectors && unknownSelectors.length > 0 && (
        <div className="ml-2 mt-3 text-sm">Unknown functions:</div>
      )}
      {unknownSelectors &&
        unknownSelectors.map((selector) => (
          <RawDecodedFragment
            fragmentType="function"
            sig={selector}
            letter="F"
            letterBg="bg-violet-500"
            hashBg="bg-violet-50"
          />
        ))}
    </div>
  );
};

export default memo(DecodedABI);
