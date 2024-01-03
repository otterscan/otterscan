import { Switch } from "@headlessui/react";
import React, { PropsWithChildren, useState } from "react";

interface LabeledSwitchProps extends PropsWithChildren {
  defaultEnabled?: boolean;
  onToggle: (newValue: boolean) => void;
}

const LabeledSwitch: React.FC<LabeledSwitchProps> = ({
  defaultEnabled = false,
  onToggle,
  children,
}) => {
  const [enabled, setEnabled] = useState<boolean>(defaultEnabled);
  return (
    <div className="pb-4 flex">
      <Switch
        checked={enabled}
        onChange={(newValue: boolean) => {
          setEnabled(newValue);
          onToggle(newValue);
        }}
        className={`${
          enabled ? "bg-link-blue/100" : "bg-gray-200"
        } relative inline-flex h-6 w-11 items-center rounded-full mr-2 transition-colors`}
      >
        <span
          className={`${
            enabled ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>{" "}
      {children}
    </div>
  );
};
export default LabeledSwitch;
