import { FC } from "react";

type TopicProps = {
  idx: number;
  data: string;
};

const Topic: FC<TopicProps> = ({ idx, data }) => (
  <span className="flex items-center space-x-2 font-mono">
    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
      {idx}
    </span>
    <span>{data}</span>
  </span>
);

export default Topic;
