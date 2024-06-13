import { Log } from "ethers";
import { FC, memo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ContentFrame from "../../components/ContentFrame";
import LogEntry from "./LogEntry";

type LogsProps = {
  logs: Log[] | undefined;
};

const Logs: FC<LogsProps> = ({ logs }) => {
  const location = useLocation();
  useEffect(() => {
    setTimeout(() => {
      if (location.hash) {
        // Scroll to fragment, e.g. "#3"
        let foundElement = document.getElementById(location.hash.slice(1));
        if (foundElement) {
          foundElement.scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    }, 200);
  }, [logs]);
  return (
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
};

export default memo(Logs);
