import React from "react";
import SelectionHighlighter, { addressSelector } from "../selection/SelectionHighlighter";

type AddressHighlighterProps = React.PropsWithChildren<{
  address: string;
}>;

// TODO: replace all occurences with SelectionHighlighter and remove this component
const AddressHighlighter: React.FC<AddressHighlighterProps> = ({
  address,
  children,
}) => (
  <SelectionHighlighter
    myType="address"
    myContent={address}
    selector={addressSelector}
  >
    {children}
  </SelectionHighlighter>
);

export default AddressHighlighter;
