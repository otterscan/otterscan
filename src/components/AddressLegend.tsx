import { FC, PropsWithChildren } from "react";

type AddressLegendProps = {
  title?: string;
  full?: boolean;
};

const AddressLegend: FC<PropsWithChildren<AddressLegendProps>> = ({
  title,
  full,
  children,
}) => (
  <span
    className={`${full ? "text-sm text-gray-500/70" : "text-xs text-gray-400/70"} not-italic`}
    title={title}
  >
    {children}
  </span>
);

export default AddressLegend;
