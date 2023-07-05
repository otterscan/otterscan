import { FC, useContext } from "react";
import Blockies from "react-blockies";
import Copy from "../../components/Copy";
import AddressSwap from "../../components/AddressSwap";
import Faucet from "../../components/Faucet";
import StandardSubtitle from "../../components/StandardSubtitle";
import { useChainInfo } from "../../useChainInfo";
import { RuntimeContext } from "../../useRuntime";
import { AddressAwareComponentProps } from "../types";
import AddressAttributes from "./AddressAttributes";
import { validation } from '@zilliqa-js/util'

type AddressSubtitleProps = AddressAwareComponentProps & {
  isENS: boolean | undefined;
  addressOrName: string;
};

const AddressSubtitle: FC<AddressSubtitleProps> = ({
  address,
  isENS,
  addressOrName,
}) => {
  const { config } = useContext(RuntimeContext);
  const { faucets } = useChainInfo();

  return (
    <StandardSubtitle>
      <div className="flex items-baseline space-x-2">
        <Blockies
          className="self-center rounded"
          seed={address.toLowerCase()}
          scale={3}
        />
        <span>Address</span>
        <AddressSwap addr={address} />
        {/* Only display faucets for testnets who actually have any */}
        {faucets && faucets.length > 0 && <Faucet address={address} rounded />}
        {isENS && (
          <span className="rounded-lg bg-gray-200 px-2 py-1 text-xs text-gray-500">
            ENS: {addressOrName}
          </span>
        )}
        {config?.experimental && <AddressAttributes address={address} full />}
      </div>
    </StandardSubtitle>
  );
};

export default AddressSubtitle;
