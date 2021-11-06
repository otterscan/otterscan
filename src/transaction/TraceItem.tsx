import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons/faPlusSquare";
import { faMinusSquare } from "@fortawesome/free-regular-svg-icons/faMinusSquare";
import { Switch } from "@headlessui/react";
import { TransactionData } from "../types";
import { FourBytesEntry } from "../use4Bytes";
import { TraceGroup } from "../useErigonHooks";
import { ResolvedAddresses } from "../api/address-resolver";
import TraceInput from "./TraceInput";

type TraceItemProps = {
  t: TraceGroup;
  txData: TransactionData;
  last: boolean;
  fourBytesMap: Record<string, FourBytesEntry | null | undefined>;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const TraceItem: React.FC<TraceItemProps> = ({
  t,
  txData,
  last,
  fourBytesMap,
  resolvedAddresses,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <>
      <div className="flex relative items-center">
        <div className="absolute border-l border-b w-5 h-full transform -translate-y-1/2"></div>
        {!last && (
          <div className="absolute left-0 border-l w-5 h-full transform translate-y-1/2"></div>
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
        <TraceInput
          t={t}
          txData={txData}
          fourBytesMap={fourBytesMap}
          resolvedAddresses={resolvedAddresses}
        />
      </div>
      {t.children && (
        <div
          className={`pl-10 ${last ? "" : "border-l"} space-y-3 ${
            expanded ? "" : "hidden"
          }`}
        >
          <TraceChildren
            c={t.children}
            txData={txData}
            fourBytesMap={fourBytesMap}
            resolvedAddresses={resolvedAddresses}
          />
        </div>
      )}
    </>
  );
};

type TraceChildrenProps = {
  c: TraceGroup[];
  txData: TransactionData;
  fourBytesMap: Record<string, FourBytesEntry | null | undefined>;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const TraceChildren: React.FC<TraceChildrenProps> = React.memo(
  ({ c, txData, fourBytesMap, resolvedAddresses }) => {
    return (
      <>
        {c.map((tc, i, a) => (
          <TraceItem
            key={i}
            t={tc}
            txData={txData}
            last={i === a.length - 1}
            fourBytesMap={fourBytesMap}
            resolvedAddresses={resolvedAddresses}
          />
        ))}
      </>
    );
  }
);

export default TraceItem;
