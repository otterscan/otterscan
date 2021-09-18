import React, { useMemo } from "react";
import { Interface } from "@ethersproject/abi";
import ContentFrame from "../ContentFrame";
import LogEntry from "./LogEntry";
import { TransactionData } from "../types";
import { Metadata } from "../useSourcify";

type LogsProps = {
  txData: TransactionData;
  metadata: Metadata | null | undefined;
};

const Logs: React.FC<LogsProps> = ({ txData, metadata }) => {
  const logDesc = useMemo(() => {
    if (!metadata || !txData) {
      return undefined;
    }

    const abi = metadata.output.abi;
    const intf = new Interface(abi as any);
    return txData.confirmedData?.logs.map((l) =>
      l.address === txData.to
        ? intf.parseLog({
            topics: l.topics,
            data: l.data,
          })
        : undefined
    );
  }, [metadata, txData]);

  return (
    <ContentFrame tabs>
      <div className="text-sm py-4">Transaction Receipt Event Logs</div>
      {txData.confirmedData &&
        txData.confirmedData.logs.map((l, i) => (
          <LogEntry key={i} txData={txData} log={l} logDesc={logDesc?.[i]} />
        ))}
    </ContentFrame>
  );
};

export default React.memo(Logs);
