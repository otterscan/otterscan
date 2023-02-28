import { FC } from "react";
import TwoColumnPanel from "./TwoColumnPanel";
import Topic from "./Topic";
import StandardTextarea from "../../../components/StandardTextarea";

type RawLogProps = {
  topics: string[];
  data: string;
};

const RawLog: FC<RawLogProps> = ({ topics, data }) => (
  <div className="space-y-2">
    <TwoColumnPanel leftPanel={"Topics"}>
      {topics.map((t, i) => (
        <Topic key={i} idx={i} data={t} />
      ))}
    </TwoColumnPanel>
    <TwoColumnPanel leftPanel="Data">
      <StandardTextarea value={data} />
    </TwoColumnPanel>
  </div>
);

export default RawLog;
