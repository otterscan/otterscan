import { Switch } from "@headlessui/react";
import React from "react";

type ExpanderSwitchProps = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const ExpanderSwitch: React.FC<ExpanderSwitchProps> = ({
  expanded,
  setExpanded,
}) => (
  <Switch
    className="font-code text-xs"
    checked={expanded}
    onChange={setExpanded}
  >
    {expanded ? <span className="text-gray-400">[-]</span> : <>[...]</>}
  </Switch>
);

export default ExpanderSwitch;
