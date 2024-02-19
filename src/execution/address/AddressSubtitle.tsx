import { faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useContext } from "react";
import Blockies from "react-blockies";
import Copy from "../../components/Copy";
import Faucet from "../../components/Faucet";
import StandardSubtitle from "../../components/StandardSubtitle";
import { useChainInfo } from "../../useChainInfo";
import { useResolvedAddress } from "../../useResolvedAddresses";
import { RuntimeContext } from "../../useRuntime";
import { AddressAwareComponentProps } from "../types";
import AddressAttributes from "./AddressAttributes";

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
        {resolvedName && resolvedNameTrusted && (
          <div className="rounded-lg bg-gray-200 px-2 py-1 text-sm text-gray-500">
            <FontAwesomeIcon icon={faTag} size="1x" /> {resolvedName}
          </div>
        )}
      </div>
    </StandardSubtitle>
  );
};

export default AddressSubtitle;
