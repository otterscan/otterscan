import React from "react";
import ContentFrame from "./ContentFrame";
import StandardSubtitle from "./StandardSubtitle";

type AddressOrENSNameNotFoundProps = {
  addressOrName: string;
};

const AddressOrENSNameNotFound: React.FC<AddressOrENSNameNotFoundProps> = ({
  addressOrName,
}) => (
  <>
    <StandardSubtitle>Transaction Details</StandardSubtitle>
    <ContentFrame>
      <div className="py-4 text-sm">
        "{addressOrName}" is not an ETH address or supported name.
      </div>
    </ContentFrame>
  </>
);

export default React.memo(AddressOrENSNameNotFound);
