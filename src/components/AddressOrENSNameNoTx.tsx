import React from "react";
import StandardSubtitle from "../StandardSubtitle";
import ContentFrame from "../ContentFrame";
import AddressOrENSName from "./AddressOrENSName";

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
        <AddressOrENSName address={addressOrENSName} />
        <span>: no outbound transactions found.</span>
      </div>
    </ContentFrame>
  </>
);

export default React.memo(AddressOrENSNameNoTx);
