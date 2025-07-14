import { useQuery } from "@tanstack/react-query";
import React, { useContext } from "react";
import ContentFrame from "../../components/ContentFrame";
import { TransactionData } from "../../types";
import { getTraceTransactionQuery } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import TransactionAddress from "../components/TransactionAddress";
import TraceItem from "./TraceItem";

type TraceProps = {
  txData: TransactionData;
};

const Trace: React.FC<TraceProps> = ({ txData }) => {
  const { provider } = useContext(RuntimeContext);
  const { data: traces } = useQuery(
    getTraceTransactionQuery(provider, txData.transactionHash),
  );

  return (
    <ContentFrame tabs>
      <div className="mb-5 mt-4 flex flex-col items-start space-y-3 overflow-x-auto font-code text-sm">
        {traces ? (
          <>
            <div className="rounded-sm border px-1 py-0.5 hover:border-gray-500 font-sans">
              <TransactionAddress address={txData.from} />
            </div>
            <div className="ml-5 space-y-3 self-stretch">
              {traces.map((t, i, a) => (
                <TraceItem key={i} t={t} last={i === a.length - 1} />
              ))}
            </div>
          </>
        ) : (
          <div className="h-7 w-96 rounded-sm border px-1 py-1 hover:border-gray-500">
            <div className="h-full w-full animate-pulse rounded-sm bg-gray-200"></div>
          </div>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Trace);
