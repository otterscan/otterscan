import { FC } from "react";
import StandardTextarea from "../../../components/StandardTextarea";
import Topic from "./Topic";
import TwoColumnPanel from "./TwoColumnPanel";

type RawLogProps = {
  topics: readonly string[];
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
