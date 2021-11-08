import React from "react";
import { Tab } from "@headlessui/react";

type ModeTabProps = {
  disabled?: boolean | undefined;
};

const ModeTab: React.FC<ModeTabProps> = ({ disabled, children }) => (
  <Tab
    className={({ selected }) =>
      `border rounded-lg px-2 py-1 bg-gray-100 ${
        disabled
          ? "text-gray-300"
          : "hover:bg-gray-200 hover:shadow text-gray-500 hover:text-gray-600"
      } text-xs ${selected ? "border-blue-300" : ""}`
    }
    disabled={disabled}
  >
    {children}
  </Tab>
);

export default ModeTab;
