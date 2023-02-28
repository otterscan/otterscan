import { FC } from "react";

type LogIndexProps = {
  idx: number;
};

const LogIndex: FC<LogIndexProps> = ({ idx }) => (
  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
    {idx}
  </span>
);

export default LogIndex;
