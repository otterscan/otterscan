import { FC, memo } from "react";
import { Log } from "@ethersproject/providers";
import ContentFrame from "../../ContentFrame";
import LogEntry from "./LogEntry";

type LogsProps = {
  logs: Log[] | undefined;
};

const Logs: FC<LogsProps> = ({ logs }) => (
  <ContentFrame tabs>
    {logs && (
      <>
        {logs.length > 0 ? (
          <>
            {logs.map((l, i) => (
              <LogEntry key={i} log={l} />
            ))}
          </>
        ) : (
          <div className="py-4 text-sm">Transaction didn't emit any logs</div>
        )}
      </>
    )}
  </ContentFrame>
);

export default memo(Logs);
