import { Interface } from "ethers";
import { FC, memo } from "react";
import { ABIAwareComponentProps } from "../../types";
import DecodedFragment from "./DecodedFragment";

const DecodedABI: FC<ABIAwareComponentProps> = ({ abi }) => {
  const intf = new Interface(abi);
  return (
    <div className="overflow-x-auto border">
      {intf.fragments.map((f, i) => (
        <DecodedFragment key={i} intf={intf} fragment={f} />
      ))}
    </div>
  );
};

export default memo(DecodedABI);
