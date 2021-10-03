import React from "react";
import { EventFragment } from "@ethersproject/abi";

type DecodedLogSignatureProps = {
  event: EventFragment;
};

const DecodedLogSignature: React.FC<DecodedLogSignatureProps> = ({ event }) => {
  return (
    <span>
      <span className="text-blue-900 font-bold">{event.name}</span>(
      {event.inputs.map((input, i) => (
        <span key={i}>
          {i > 0 ? ", " : ""}
          <span>{input.format("full")}</span>
        </span>
      ))}
      ){event.anonymous ? " anonymous" : ""}
    </span>
  );
};

export default React.memo(DecodedLogSignature);
