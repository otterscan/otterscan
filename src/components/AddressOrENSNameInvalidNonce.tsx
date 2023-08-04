import React from "react";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";

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
