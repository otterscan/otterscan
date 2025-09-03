import React from "react";
import { useOutletContext } from "react-router";
import ContentFrame from "../../components/ContentFrame";
import KlerosAddressInfo from "../../kleros/KlerosAddressInfo";
import { useKlerosAddressTags } from "../../kleros/useKleros";
import { type AddressOutletContext } from "../AddressMainPage";

const AddressKlerosInfo: React.FC = () => {
  const { address } = useOutletContext() as AddressOutletContext;
  const klerosTags = useKlerosAddressTags(address);

  if (!klerosTags || klerosTags.length === 0) {
    return (
      <ContentFrame>
        <div className="py-4 text-center text-gray-500">
          No Kleros verification data available for this address.
        </div>
      </ContentFrame>
    );
  }

  return (
    <ContentFrame>
      <div className="py-4">
        <KlerosAddressInfo tags={klerosTags} />
      </div>
    </ContentFrame>
  );
};

export default AddressKlerosInfo;
