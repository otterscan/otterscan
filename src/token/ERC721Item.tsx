import { FC, memo } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import CanBeEmptyText from "../components/CanBeEmptyText";
import { ChecksummedAddress } from "../types";
import { ResultMapper } from "../ots2/useUIHooks";

type ERC721ItemProps = {
  blockNumber: number;
  timestamp: number;
  address: ChecksummedAddress;
  name: string;
  symbol: string;
};

export const mapper: ResultMapper<ERC721ItemProps> = (m, blocksSummary) => ({
  blockNumber: m.blockNumber,
  timestamp: blocksSummary.get(m.blockNumber)!.timestamp,
  address: m.address,
  name: m.name,
  symbol: m.symbol,
});

const ERC721Item: FC<ERC721ItemProps> = ({
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

export default memo(ERC721Item);
