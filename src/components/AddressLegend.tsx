import { FC, PropsWithChildren } from "react";

type AddressLegendProps = {
  title?: string;
  full?: boolean;
  uniqueId: string;
};

const AddressLegend: FC<PropsWithChildren<AddressLegendProps>> = ({
  title,
  full,
  children,
}) => (
  // TODO: fix sizing of highlight boxes
  // <SelectionHighlighter
  //   myType="tag"
  //   myContent={uniqueId}
  //   selector={tagSelector}
  // >
  <span
    className={`font-code ${
      full ? "text-sm text-gray-500/70" : "text-xs text-gray-400/70"
    } text-clip not-italic`}
    title={title}
  >
    {children}
  </span>
  // </SelectionHighlighter>
);

export default AddressLegend;
