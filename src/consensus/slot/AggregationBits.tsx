import { getBytes } from "ethers";
import { FC } from "react";

type AggregationBitsProps = {
  hex: string;
};

const AggregationBits: FC<AggregationBitsProps> = ({ hex }) => {
  const bm = Array.from(getBytes(hex));
  return (
    <div className="overflow-x-auto md:overflow-visible">
      <div className="grid w-max md:w-fit grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 font-hash">
        {bm.map((b, i) => (
          <Bitmap key={i} b={b} />
        ))}
      </div>
    </div>
  );
};

type BitmapProps = {
  b: number;
};

const Bitmap: FC<BitmapProps> = ({ b }) => {
  const elems = [];
  for (let i = 0; i < 8; i++) {
    elems.push(
      b & (1 << i) ? (
        <span key={i}>1</span>
      ) : (
        <span key={i} className="text-red-500">
          0
        </span>
      ),
    );
  }
  return <span>{elems}</span>;
};

export default AggregationBits;
