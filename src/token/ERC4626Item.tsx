import { FC, memo } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import CanBeEmptyText from "../components/CanBeEmptyText";
import { ChecksummedAddress } from "../types";

export type ERC4626ItemProps = {
  blockNumber: number;
  timestamp: number;
  address: ChecksummedAddress;
  name: string;
  symbol: string;
  decimals: number;
  asset: string;
  totalAssets: number;
};

const ERC4626Item: FC<ERC4626ItemProps> = ({
  blockNumber,
  timestamp,
  address,
  name,
  symbol,
  decimals,
  asset,
  totalAssets,
}) => (
  <tr>
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
    <td>{decimals}</td>
    <td>
      <DecoratedAddressLink address={asset} />
    </td>
    <td>{totalAssets}</td>
  </tr>
);

export default memo(ERC4626Item);
