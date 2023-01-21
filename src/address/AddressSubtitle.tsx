import { FC, useContext } from "react";
import Blockies from "react-blockies";
import StandardSubtitle from "../StandardSubtitle";
import Copy from "../components/Copy";
import Faucet from "../components/Faucet";
import AddressAttributes from "./AddressAttributes";
import { RuntimeContext } from "../useRuntime";
import { useChainInfo } from "../useChainInfo";
import { ChecksummedAddress } from "../types";

type AddressSubtitleProps = {
  checksummedAddress: ChecksummedAddress;
  isENS: boolean | undefined;
  addressOrName: string;
};

const AddressSubtitle: FC<AddressSubtitleProps> = ({
  checksummedAddress,
  isENS,
  addressOrName,
}) => {
  const { config } = useContext(RuntimeContext);
  const { network, faucets } = useChainInfo();

  return (
    <StandardSubtitle>
      <div className="flex space-x-2 items-baseline">
        <Blockies
          className="self-center rounded"
          seed={checksummedAddress.toLowerCase()}
          scale={3}
        />
        <span>Address</span>
        <span className="font-address text-base text-gray-500">
          {checksummedAddress}
        </span>
        <Copy value={checksummedAddress} rounded />
        {/* Only display faucets for testnets who actually have any */}
        {network === "testnet" && faucets && faucets.length > 0 && (
          <Faucet address={checksummedAddress} rounded />
        )}
        {isENS && (
          <span className="rounded-lg px-2 py-1 bg-gray-200 text-gray-500 text-xs">
            ENS: {addressOrName}
          </span>
        )}
        {config?.experimental && (
          <AddressAttributes address={checksummedAddress} full />
        )}
      </div>
    </StandardSubtitle>
  );
};

export default AddressSubtitle;
