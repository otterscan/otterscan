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
        <AddressLegend full={full} title="ERC20 token" uniqueId="erc20">
          [{full ? "ERC20" : "20"}]
        </AddressLegend>
      )}
      {attr?.erc165 && (
        <AddressLegend full={full} title="ERC165 contract" uniqueId="erc165">
          [{full ? "ERC165" : "165"}]
        </AddressLegend>
      )}
      {attr?.erc721 && (
        <AddressLegend full={full} title="ERC721 token" uniqueId="erc721">
          [{full ? "ERC721" : "721"}]
        </AddressLegend>
      )}
      {attr?.erc1155 && (
        <AddressLegend full={full} title="ERC1155 token" uniqueId="erc1155">
          [{full ? "ERC1155" : "1155"}]
        </AddressLegend>
      )}
    </>
  );
};

export default AddressAttributes;
