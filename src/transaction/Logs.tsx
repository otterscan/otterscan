import React from "react";
import ContentFrame from "../ContentFrame";
import LogEntry from "./LogEntry";
import { TransactionData } from "../types";

type LogsProps = {
  txData: TransactionData;
};

const Logs: React.FC<LogsProps> = ({ txData }) => (
  <ContentFrame tabs>
    {txData.confirmedData && (
      <>
        {txData.confirmedData.logs.length > 0 ? (
          <>
            {txData.confirmedData.logs.map((l, i) => (
              <LogEntry key={i} log={l} />
            ))}
          </>
        ) : (
          <div className="text-sm py-4">Transaction didn't emit any logs</div>
        )}
      </>
    )}
  </ContentFrame>
);

export default React.memo(Logs);
