import { FC, PropsWithChildren } from "react";
import { Tab } from "@headlessui/react";

type ModeTabProps = {
  disabled?: boolean | undefined;
};

const ModeTab: FC<PropsWithChildren<ModeTabProps>> = ({
  disabled,
  children,
}) => (
  <Tab
    className={({ selected }) =>
      `rounded-lg border bg-gray-100 px-2 py-1 ${
        disabled
          ? "cursor-default border-gray-100 text-gray-300"
          : "text-gray-500 hover:bg-gray-200 hover:text-gray-600 hover:shadow"
      } text-xs ${selected ? "border-blue-300" : ""}`
    }
    disabled={disabled}
  >
    {children}
  </Tab>
);

export default ModeTab;
