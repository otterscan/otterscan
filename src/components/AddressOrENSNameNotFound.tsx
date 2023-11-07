import React from "react";
import ContentFrame from "./ContentFrame";
import StandardSubtitle from "./StandardSubtitle";

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
