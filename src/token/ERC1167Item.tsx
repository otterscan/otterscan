import { FC, memo } from "react";
import AddressHighlighter from "../components/AddressHighlighter";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import { ResultMapper } from "../ots2/useUIHooks";
import { ChecksummedAddress } from "../types";

type ERC1167ItemProps = {
  blockNumber: bigint;
  timestamp: number;
  address: ChecksummedAddress;
  implementation: ChecksummedAddress;
};

export const mapper: ResultMapper<ERC1167ItemProps> = (m, blocksSummary) => ({
  blockNumber: m.blockNumber,
  timestamp: blocksSummary.get(m.blockNumber)!.timestamp,
  address: m.address,
  implementation: m.implementation,
});

const ERC1167Item: FC<ERC1167ItemProps> = ({
  blockNumber,
  timestamp,
  address,
  implementation,
}) => (
  <>
    <td>
      <DecoratedAddressLink address={address} eoa={false} plain />
    </td>
    <td>
      <BlockLink blockTag={blockNumber} />
    </td>
    <td>
      <TimestampAge timestamp={timestamp} />
    </td>
    <td className="inline-flex">
      <AddressHighlighter address={implementation}>
        <DecoratedAddressLink address={implementation} eoa={false} />
      </AddressHighlighter>
    </td>
  </>
);

export default memo(ERC1167Item);
