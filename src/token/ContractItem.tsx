import { FC, memo } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import { ChecksummedAddress } from "../types";
import { ResultMapper } from "../ots2/useUIHooks";

type ContractItemProps = {
  blockNumber: number;
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
