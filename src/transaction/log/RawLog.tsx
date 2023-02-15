import { FC } from "react";
import Topic from "./Topic";
import StandardTextarea from "../../components/StandardTextarea";

type RawLogProps = {
  topics: string[];
  data: string;
};

const RawLog: FC<RawLogProps> = ({ topics, data }) => (
  <div className="space-y-2">
    {topics.map((t, i) => (
      <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm" key={i}>
        <div className="text-right">{i === 0 && "Topics"}</div>
        <div className="col-span-11">
          <Topic idx={i} data={t} />
        </div>
      </div>
    ))}
    <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
      <div className="pt-2 text-right">Data</div>
      <div className="col-span-11">
        <StandardTextarea value={data} />
      </div>
    </div>
  </div>
);

export default RawLog;
