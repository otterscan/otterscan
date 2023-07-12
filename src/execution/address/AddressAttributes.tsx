import { FC, useContext } from "react";
import { AddressAwareComponentProps } from "../types";
import AddressLegend from "../../components/AddressLegend";
import { useAddressAttributes } from "../../ots2/usePrototypeTransferHooks";
import { RuntimeContext } from "../../useRuntime";

type AddressAttributesProps = AddressAwareComponentProps & {
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
      {attr?.erc1167 && (
        <AddressLegend
          full={full}
          title="ERC1167 minimal proxy"
          uniqueId="erc1167"
        >
          [{full ? "ERC1167" : "1167"}]
        </AddressLegend>
      )}
      {attr?.erc1167Logic && (
        <AddressLegend
          full={full}
          title="ERC1167 logic contract"
          uniqueId="erc1167logic"
        >
          [{full ? "ERC1167-Logic" : "1167-L"}]
        </AddressLegend>
      )}
      {attr?.erc1167 && (
        <AddressLegend full={full} title="Proxy" uniqueId="proxy">
          [P]
        </AddressLegend>
      )}
      {attr?.erc1167Logic && (
        <AddressLegend full={full} title="Logic" uniqueId="logic">
          [L]
        </AddressLegend>
      )}
    </>
  );
};

export default AddressAttributes;
