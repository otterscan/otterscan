import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinusSquare,
  faPlusSquare,
} from "@fortawesome/free-regular-svg-icons";
import { Switch } from "@headlessui/react";
import { TraceGroup } from "../useErigonHooks";
import TraceInput from "./TraceInput";

type TraceItemProps = {
  t: TraceGroup;
  last: boolean;
};

const TraceItem: React.FC<TraceItemProps> = ({ t, last }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <>
      <div className="relative flex">
        <div className="absolute h-6 w-5 -translate-y-3 border-l border-b"></div>
        {!last && (
          <div className="absolute left-0 h-full w-5 translate-y-3 border-l"></div>
        )}
        {t.children && (
          <Switch
            className="absolute left-0 -translate-x-1/2 bg-white text-gray-500"
            checked={expanded}
            onChange={setExpanded}
          >
            <FontAwesomeIcon
              icon={expanded ? faMinusSquare : faPlusSquare}
              size="1x"
            />
          </Switch>
        )}
        <TraceInput t={t} />
      </div>
      {t.children && (
        <div
          className={`pl-10 ${last ? "" : "border-l"} space-y-3 ${
            expanded ? "" : "hidden"
          }`}
        >
          <TraceChildren c={t.children} />
        </div>
      )}
    </>
  );
};

type TraceChildrenProps = {
  c: TraceGroup[];
};

const TraceChildren: React.FC<TraceChildrenProps> = React.memo(({ c }) => {
  return (
    <>
      {c.map((tc, i, a) => (
        <TraceItem key={i} t={tc} last={i === a.length - 1} />
      ))}
    </>
  );
});

export default TraceItem;
