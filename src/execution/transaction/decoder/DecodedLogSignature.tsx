import { FC, memo } from "react";
import { EventFragment } from "ethers";

type DecodedLogSignatureProps = {
  event: EventFragment;
};

const DecodedLogSignature: FC<DecodedLogSignatureProps> = ({ event }) => (
  <span className="font-mono">
    <span className="font-bold text-blue-900">{event.name}</span>(
    {event.inputs.map((input, i) => (
      <span key={i}>
        {i > 0 ? ", " : ""}
        <span>
          {input.format ? input.format("full") : `${input.type} ${input.name}`}
        </span>
      </span>
    ))}
    ){event.anonymous ? " anonymous" : ""}
  </span>
);

export default memo(DecodedLogSignature);
