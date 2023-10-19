import { FC, memo } from "react";
import BlockLink from "../components/BlockLink";
import CanBeEmptyText from "../components/CanBeEmptyText";
import TimestampAge from "../components/TimestampAge";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import { ResultMapper } from "../ots2/useUIHooks";
import { ChecksummedAddress } from "../types";

type ERC1155ItemProps = {
  blockNumber: bigint;
  timestamp: number;
  address: ChecksummedAddress;
  name: string;
  symbol: string;
};

export const mapper: ResultMapper<ERC1155ItemProps> = (m, blocksSummary) => ({
  blockNumber: m.blockNumber,
  timestamp: blocksSummary.get(m.blockNumber)!.timestamp,
  address: m.address,
  name: m.name,
  symbol: m.symbol,
});

const ERC1155Item: FC<ERC1155ItemProps> = ({
  blockNumber,
  timestamp,
  address,
  name,
  symbol,
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
    <td>
      <CanBeEmptyText text={name} />
    </td>
    <td>
      <CanBeEmptyText text={symbol} />
    </td>
  </>
);

export default memo(ERC1155Item);
