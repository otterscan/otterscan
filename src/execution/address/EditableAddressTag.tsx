import { faCheck, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FC, useEffect } from "react";
import { mutate } from "swr";
import { customLabelResolver } from "../../api/address-resolver";
import { CustomLabelFetcher } from "../../api/address-resolver/CustomLabelResolver";
import { AddressAwareComponentProps } from "../types";

type EditableAddressTagProps = AddressAwareComponentProps & {
  defaultTag: string | undefined;
  editedCallback?: (newLabel: string) => void;
};

async function setAddressLabel(address: string, label: string | null) {
  if (label === null) {
    return;
  }
  const trimmedLabel = label.trim();
  await CustomLabelFetcher.getInstance().updateLabels({
    [address]: trimmedLabel,
  });
  // Update the SWR entry so that all components using this label are invalidated
  mutate(address, [customLabelResolver, trimmedLabel]);
}

export async function clearAllLabels() {
  const customLabelFetcher = CustomLabelFetcher.getInstance();
  const addresses: string[] = await customLabelFetcher.getAllAddresses();
  await customLabelFetcher.updateLabels(
    addresses.reduce(
      (obj: Record<string, string>, key: string) => ({ ...obj, [key]: "" }),
      {},
    ),
  );
  addresses.forEach((address) => mutate(address));
}

const EditableAddressTag: FC<EditableAddressTagProps> = ({
  address,
  defaultTag,
  editedCallback,
}) => {
  const inputRef = React.createRef<HTMLInputElement>();
  const formRef = React.createRef<HTMLFormElement>();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setAddressLabel(
          address,
          inputRef.current ? inputRef.current.value : null,
        );
        if (editedCallback && inputRef.current) {
          editedCallback(inputRef.current.value);
        }
      }}
      className="flex space-x-1 text-sm"
      ref={formRef}
    >
      <div className="rounded-lg bg-gray-200 px-2 py-1 text-sm text-gray-500 space-x-1">
        <FontAwesomeIcon icon={faTag} size="1x" />
        <input
          type="text"
          data-address={address}
          placeholder={defaultTag ?? "Address"}
          defaultValue={defaultTag}
          ref={inputRef}
        />
      </div>
      <button
        className={`flex-no-wrap flex items-center justify-center space-x-1 self-center text-gray-500 ${"transition-shadows h-7 w-7 rounded-full bg-gray-200 text-xs transition-colors hover:bg-gray-500 hover:text-gray-200 hover:shadow"}`}
        title="Submit address label"
        type="submit"
      >
        <FontAwesomeIcon icon={faCheck} size="1x" />
      </button>
    </form>
  );
};

export default EditableAddressTag;
