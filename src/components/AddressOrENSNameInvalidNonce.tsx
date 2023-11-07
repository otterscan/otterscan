import React from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import ContentFrame from "./ContentFrame";
import StandardSubtitle from "./StandardSubtitle";

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
        <DecoratedAddressLink address={addressOrENSName} />
        <span>: no transaction found for nonce="{nonce}".</span>
      </div>
    </ContentFrame>
  </>
);

export default React.memo(AddressOrENSNameInvalidNonce);
