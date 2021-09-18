import React from "react";
import { Tab } from "@headlessui/react";

const ModeTab: React.FC = ({ children }) => (
  <Tab
    className={({ selected }) =>
      `border rounded-lg px-2 py-1 bg-gray-100 hover:bg-gray-200 hover:shadow text-xs text-gray-500 hover:text-gray-600 ${
        selected ? "border-blue-300" : ""
      }`
    }
  >
    {children}
  </Tab>
);

export default ModeTab;
