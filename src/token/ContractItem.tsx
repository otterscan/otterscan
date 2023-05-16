import { FC, memo } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import { ChecksummedAddress } from "../types";

export type ContractItemProps = {
  blockNumber: number;
  timestamp: number;
  address: ChecksummedAddress;
};

const ContractItem: FC<ContractItemProps> = ({
  blockNumber,
  timestamp,
  address,
}) => (
  <>
    <td>
      <DecoratedAddressLink address={address} plain />
    </td>
    <td>
      <BlockLink blockTag={blockNumber} />
    </td>
    <td>
      <TimestampAge timestamp={timestamp} />
    </td>
  </>
);

export default memo(ContractItem);
