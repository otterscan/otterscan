import { EventFragment } from "ethers";
import { FC, memo } from "react";

type DecodedScillaLogSignatureProps = {
  name: string;
  address: string;
};

const DecodedScillaLogSignature: FC<DecodedScillaLogSignatureProps> = ({ event }) => {
  if (event) {
  return (
    <span className="font-mono">
      <span className="font-italic">_eventName:</span> <span className="font-bold text-blue-900">{event.name}</span><br/>
          <span className="font-italic">address:</span> <span className="font-bold text-blue-500">{event.address}</span><br/>
      </span>)
  } else {
    return ( <div /> )
  }
}

export default memo(DecodedScillaLogSignature);
