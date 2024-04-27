import {
  faPencil,
  faTag,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useContext, useState } from "react";
import Blockies from "react-blockies";
import Copy from "../../components/Copy";
import Faucet from "../../components/Faucet";
import StandardSubtitle from "../../components/StandardSubtitle";
import { useChainInfo } from "../../useChainInfo";
import { useResolvedAddress } from "../../useResolvedAddresses";
import { RuntimeContext } from "../../useRuntime";
import { AddressAwareComponentProps } from "../types";
import AddressAttributes from "./AddressAttributes";
import EditableAddressTag, { clearAllLabels } from "./EditableAddressTag";

type AddressSubtitleProps = AddressAwareComponentProps & {
  isENS: boolean | undefined;
  addressOrName: string;
};

const AddressSubtitle: FC<AddressSubtitleProps> = ({
  address,
  isENS,
  addressOrName,
}) => {
  const { config, provider } = useContext(RuntimeContext);
  const { faucets } = useChainInfo();

  const resolvedAddress = useResolvedAddress(provider, address);
  let resolvedName = resolvedAddress
    ? resolvedAddress[0].resolveToString(resolvedAddress[1])
    : undefined;
  let resolvedNameTrusted = resolvedAddress
    ? resolvedAddress[0].trusted(resolvedAddress[1])
    : undefined;
  if (isENS && !resolvedName) {
    resolvedName = "ENS: " + addressOrName;
    resolvedNameTrusted = true;
  }

  const [editingAddressTag, setEditingAddressTag] = useState<boolean>(false);

  return (
    <StandardSubtitle>
      <div className="flex items-baseline space-x-2">
        <Blockies
          className="self-center rounded"
          seed={address.toLowerCase()}
          scale={3}
        />
        <span>Address</span>
        <span
          className="font-address text-base text-gray-500"
          data-test="address"
        >
          {address}
        </span>
        <Copy value={address} rounded />
        {/* Only display faucets for testnets who actually have any */}
        {faucets && faucets.length > 0 && <Faucet address={address} rounded />}
        {config?.experimental && <AddressAttributes address={address} full />}
        {resolvedName && resolvedNameTrusted && !editingAddressTag && (
          <div className="rounded-lg bg-gray-200 px-2 py-1 text-sm text-gray-500 text-nowrap">
            <FontAwesomeIcon icon={faTag} size="1x" />
            <span className="pl-1 text-nowrap">{resolvedName}</span>
          </div>
        )}
        {config?.WIP_customAddressLabels && (
          <div className="flex flex-no-wrap space-x-1">
            {editingAddressTag && (
              <EditableAddressTag
                address={address}
                defaultTag={resolvedName}
                editedCallback={(address: string) =>
                  setEditingAddressTag(false)
                }
              />
            )}
            <button
              className={`flex-no-wrap flex items-center justify-center space-x-1 self-center text-gray-500 focus:outline-none transition-shadows h-7 w-7 rounded-full bg-gray-200 text-xs transition-colors hover:bg-gray-500 hover:text-gray-200 hover:shadow`}
              title={
                editingAddressTag ? "Cancel changes" : "Edit address label"
              }
              onClick={() => setEditingAddressTag(!editingAddressTag)}
            >
              <FontAwesomeIcon
                icon={editingAddressTag ? faTimes : faPencil}
                size="1x"
              />
            </button>
            {/* For debugging only; we'll want to create an address label management page. */}
            <button
              className={`flex-no-wrap flex items-center justify-center space-x-1 self-center text-red-500 focus:outline-none transition-shadows h-7 w-7 rounded-full bg-red-200 text-xs transition-colors hover:bg-red-500 hover:text-gray-200 hover:shadow`}
              title={"Delete all labels"}
              onClick={clearAllLabels}
            >
              <FontAwesomeIcon icon={faTrash} size="1x" />
            </button>
          </div>
        )}
      </div>
    </StandardSubtitle>
  );
};

export default AddressSubtitle;
