import React from "react";
import { EventFragment } from "@ethersproject/abi";

type DecodedLogSignatureProps = {
  event: EventFragment;
};

const DecodedLogSignature: React.FC<DecodedLogSignatureProps> = ({ event }) => {
  return (
    <span>
      <span className="font-bold text-blue-900">{event.name}</span>(
      {event.inputs.map((input, i) => (
        <span key={i}>
          {i > 0 ? ", " : ""}
          <span>{input.format ? input.format("full") : `${input.type} ${input.name}`}</span>
        </span>
      ))}
      ){event.anonymous ? " anonymous" : ""}
    </span>
  );
};

export default React.memo(DecodedLogSignature);
