import React from "react";
import { Switch } from "@headlessui/react";

type ExpanderSwitchProps = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const ExpanderSwitch: React.FC<ExpanderSwitchProps> = ({
  expanded,
  setExpanded,
}) => (
  <Switch
    className="text-xs font-code"
    checked={expanded}
    onChange={setExpanded}
  >
    {expanded ? <span className="text-gray-400">[-]</span> : <>[...]</>}
  </Switch>
);

export default ExpanderSwitch;
