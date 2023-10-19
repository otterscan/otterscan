import { FC, memo } from "react";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import { ResultMapper } from "../ots2/useUIHooks";
import { ChecksummedAddress } from "../types";

type ContractItemProps = {
  blockNumber: bigint;
  timestamp: number;
  address: ChecksummedAddress;
};

export const mapper: ResultMapper<ContractItemProps> = (m, blocksSummary) => ({
  blockNumber: m.blockNumber,
  timestamp: blocksSummary.get(m.blockNumber)!.timestamp,
  address: m.address,
});

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
