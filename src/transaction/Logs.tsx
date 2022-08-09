import React, { useContext, useMemo } from "react";
import { Interface } from "@ethersproject/abi";
import ContentFrame from "../ContentFrame";
import LogEntry from "./LogEntry";
import { TransactionData } from "../types";
import { Metadata } from "../sourcify/useSourcify";
import { RuntimeContext } from "../useRuntime";
import { useContractsMetadata } from "../hooks";

type LogsProps = {
  txData: TransactionData;
  metadata: Metadata | null | undefined;
};

const Logs: React.FC<LogsProps> = ({ txData, metadata }) => {
  const baseMetadatas = useMemo((): Record<string, Metadata | null> => {
    if (!txData.to || metadata === undefined) {
      return {};
    }

    const md: Record<string, Metadata | null> = {};
    md[txData.to] = metadata;
    return md;
  }, [txData.to, metadata]);

  const logAddresses = useMemo(
    () => txData.confirmedData?.logs.map((l) => l.address) ?? [],
    [txData]
  );
  const { provider } = useContext(RuntimeContext);
  const metadatas = useContractsMetadata(logAddresses, provider, baseMetadatas);

  const logDescs = useMemo(() => {
    if (!txData) {
      return undefined;
    }

    return txData.confirmedData?.logs.map((l) => {
      const mt = metadatas[l.address];
      if (!mt) {
        return mt;
      }

      const abi = mt.output.abi;
      const intf = new Interface(abi as any);
      try {
        return intf.parseLog({
          topics: l.topics,
          data: l.data,
        });
      } catch (err) {
        console.warn("Couldn't find function signature", err);
        return null;
      }
    });
  }, [metadatas, txData]);

  return (
    <ContentFrame tabs>
      {txData.confirmedData && (
        <>
          {txData.confirmedData.logs.length > 0 ? (
            <>
              {txData.confirmedData.logs.map((l, i) => (
                <LogEntry key={i} log={l} logDesc={logDescs?.[i]} />
              ))}
            </>
          ) : (
            <div className="text-sm py-4">Transaction didn't emit any logs</div>
          )}
        </>
      )}
    </ContentFrame>
  );
};

export default React.memo(Logs);
