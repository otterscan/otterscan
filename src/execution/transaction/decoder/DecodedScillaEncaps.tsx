import { EventFragment } from "ethers";
import { FC, memo } from "react";

type DecodedScillaEncaps = {
  kind: string;
  description: string;
};

const DecodedScillaEncaps: FC<DecodedScillaEncapsProps> = ( event ) => {
  if (event) {
  return ( 
    <span className="font-mono">
      <span className="font-italic">kind:</span> <span className="font-bold text-blue-900">{event.kind}</span><br/>
      <span className="font-italic">description:</span> <span className="font-bold text-blue-500">{event.description}</span><br/>
      </span>)
  } else {
    return ( <div /> )
  }
}

export default memo(DecodedScillaEncaps);
