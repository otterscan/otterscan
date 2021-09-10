import React from "react";
import { RadioGroup } from "@headlessui/react";
import { SourcifySource } from "../url";

type RadioButtonProps = {
  value: SourcifySource;
};

const RadioButton: React.FC<RadioButtonProps> = ({ value, children }) => (
  <RadioGroup.Option
    className={({ checked }) =>
      `border rounded px-2 py-1 cursor-pointer ${
        checked
          ? "bg-blue-400 hover:bg-blue-500 text-white"
          : "hover:bg-gray-200"
      }`
    }
    value={value}
  >
    {children}
  </RadioGroup.Option>
);

export default RadioButton;
