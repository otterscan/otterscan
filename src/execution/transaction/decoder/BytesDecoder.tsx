import { FC, memo } from "react";

type BytesDecoderProps = {
  r: any;
};

const BytesDecoder: FC<BytesDecoderProps> = ({ r }) => (
  <span className="font-code">
    {r.toString()}
    <span className="select-none"> </span>
    <span className="font-sans text-xs text-gray-400 select-none">
      {r.toString().length / 2 - 1}{" "}
      {r.toString().length / 2 - 1 === 1 ? "byte" : "bytes"}
    </span>
  </span>
);

export default memo(BytesDecoder);
