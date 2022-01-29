import React from "react";
import StandardSubtitle from "../StandardSubtitle";
import ContentFrame from "../ContentFrame";

type AddressOrENSNameNotFoundProps = {
  addressOrENSName: string;
};

const AddressOrENSNameNotFound: React.FC<AddressOrENSNameNotFoundProps> = ({
  addressOrENSName,
}) => (
  <>
    <StandardSubtitle>Transaction Details</StandardSubtitle>
    <ContentFrame>
      <div className="py-4 text-sm">
        "{addressOrENSName}" is not an ETH address or ENS name.
      </div>
    </ContentFrame>
  </>
);

export default React.memo(AddressOrENSNameNotFound);
