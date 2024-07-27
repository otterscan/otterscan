import { FC } from "react";
import { Link } from "react-router-dom";

type LogIndexProps = {
  idx: number;
};

const LogIndex: FC<LogIndexProps> = ({ idx }) => (
  <Link
    to={`#${idx}`}
    className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 hover:underline"
    id={idx.toString()}
  >
    {idx}
  </Link>
);

export default LogIndex;
