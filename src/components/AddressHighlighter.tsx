import React from "react";
import SelectionHighlighter, { addressSelector } from "./SelectionHighlighter";

type AddressHighlighterProps = React.PropsWithChildren<{
  address: string;
}>;

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
