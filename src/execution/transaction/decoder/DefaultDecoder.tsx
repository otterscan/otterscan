import { FC, memo } from "react";

type DefaultDecoderProps = {
  r: any;
};

const DefaultDecoder: FC<DefaultDecoderProps> = ({ r }) => (
  <span className="font-code">{r.toString()}</span>
);

export default memo(DefaultDecoder);
