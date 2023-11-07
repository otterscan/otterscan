import React from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import ContentFrame from "./ContentFrame";
import StandardSubtitle from "./StandardSubtitle";

type AddressOrENSNameNoTxProps = {
  addressOrENSName: string;
};

const AddressOrENSNameNoTx: React.FC<AddressOrENSNameNoTxProps> = ({
  addressOrENSName,
}) => (
  <>
    <StandardSubtitle>Transaction Details</StandardSubtitle>
    <ContentFrame>
      <div className="flex py-4 text-sm">
        <DecoratedAddressLink address={addressOrENSName} />
        <span>: no outbound transactions found.</span>
      </div>
    </ContentFrame>
  </>
);

export default React.memo(AddressOrENSNameNoTx);
