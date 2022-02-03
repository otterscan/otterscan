import React from "react";
import StandardSubtitle from "../StandardSubtitle";
import ContentFrame from "../ContentFrame";
import AddressOrENSName from "./AddressOrENSName";

type AddressOrENSNameInvalidNonceProps = {
  addressOrENSName: string;
  nonce: string;
};

const AddressOrENSNameInvalidNonce: React.FC<
  AddressOrENSNameInvalidNonceProps
> = ({ addressOrENSName, nonce }) => (
  <>
    <StandardSubtitle>Transaction Details</StandardSubtitle>
    <ContentFrame>
      <div className="flex py-4 text-sm">
        <AddressOrENSName address={addressOrENSName} />
        <span>: no transaction found for nonce="{nonce}".</span>
      </div>
    </ContentFrame>
  </>
);

export default React.memo(AddressOrENSNameInvalidNonce);
