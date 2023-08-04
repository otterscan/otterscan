import React from "react";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";

type AddressOrENSNameNotFoundProps = {
  addressOrENSName: string;
  supportsENS: boolean;
};

const AddressOrENSNameNotFound: React.FC<AddressOrENSNameNotFoundProps> = ({
  addressOrENSName,
  supportsENS,
}) => (
  <>
    <StandardSubtitle>Transaction Details</StandardSubtitle>
    <ContentFrame>
      <div className="py-4 text-sm">
        "{addressOrENSName}" is not an ETH address
        {supportsENS && " or ENS name"}.
      </div>
    </ContentFrame>
  </>
);

export default React.memo(AddressOrENSNameNotFound);
