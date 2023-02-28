import React from "react";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import DecoratedAddressLink from "./DecoratedAddressLink";

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
