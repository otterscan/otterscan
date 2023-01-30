import { FC, useContext } from "react";
import AddressLegend from "../components/AddressLegend";
import { useAddressAttributes } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import { ChecksummedAddress } from "../types";

type AddressAttributesProps = {
  address: ChecksummedAddress;
  full?: boolean;
};

const AddressAttributes: FC<AddressAttributesProps> = ({ address, full }) => {
  const { provider } = useContext(RuntimeContext);
  const attr = useAddressAttributes(provider, address);

  return (
    <>
      {attr?.erc20 && (
        <AddressLegend full={full} title="ERC20 token">
          [{full ? "ERC20" : "20"}]
        </AddressLegend>
      )}
      {attr?.erc165 && (
        <AddressLegend full={full} title="ERC165 contract">
          [{full ? "ERC165" : "165"}]
        </AddressLegend>
      )}
      {attr?.erc721 && (
        <AddressLegend full={full} title="ERC721 token">
          [{full ? "ERC721" : "721"}]
        </AddressLegend>
      )}
      {attr?.erc1155 && (
        <AddressLegend full={full} title="ERC1155 token">
          [{full ? "ERC1155" : "1155"}]
        </AddressLegend>
      )}
    </>
  );
};

export default AddressAttributes;
