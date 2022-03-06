import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons/faPlusSquare";
import { faMinusSquare } from "@fortawesome/free-regular-svg-icons/faMinusSquare";
import { Switch } from "@headlessui/react";
import { TraceGroup } from "../useErigonHooks";
import TraceInput from "./TraceInput";
import { TransactionData } from "../types";

type TraceItemProps = {
  t: TraceGroup;
  last: boolean;
  txData: TransactionData;
};

const TraceItem: React.FC<TraceItemProps> = ({ t, last, txData }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <>
      <div className="flex relative">
        <div className="absolute border-l border-b w-5 h-6 transform -translate-y-3"></div>
        {!last && (
          <div className="absolute left-0 border-l w-5 h-full transform translate-y-3"></div>
        )}
        {t.children && (
          <Switch
            className="absolute left-0 bg-white transform -translate-x-1/2 text-gray-500"
            checked={expanded}
            onChange={setExpanded}
          >
            <FontAwesomeIcon
              icon={expanded ? faMinusSquare : faPlusSquare}
              size="1x"
            />
          </Switch>
        )}
        <TraceInput t={t} txData={txData} />
      </div>
      {t.children && (
        <div
          className={`pl-10 ${last ? "" : "border-l"} space-y-3 ${
            expanded ? "" : "hidden"
          }`}
        >
          <TraceChildren c={t.children} txData={txData} />
        </div>
      )}
    </>
  );
};

type TraceChildrenProps = {
  c: TraceGroup[];
  txData: TransactionData;
};

const TraceChildren: React.FC<TraceChildrenProps> = React.memo(
  ({ c, txData }) => {
    return (
      <>
        {c.map((tc, i, a) => (
          <TraceItem key={i} t={tc} last={i === a.length - 1} txData={txData} />
        ))}
      </>
    );
  }
);

export default TraceItem;
