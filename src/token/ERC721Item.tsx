import { FC, memo, useContext } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import CanBeEmptyText from "../components/CanBeEmptyText";
import { RuntimeContext } from "../useRuntime";
import {
  ContractMatch,
  useBlockData,
  useERC721Metadata,
} from "../useErigonHooks";

type ERC721ItemProps = {
  m: ContractMatch;
};

const ERC721Item: FC<ERC721ItemProps> = ({ m: { address, blockNumber } }) => {
  const { provider } = useContext(RuntimeContext);
  const erc721Meta = useERC721Metadata(provider, address, blockNumber);
  const block = useBlockData(provider, blockNumber.toString());

  return (
    <tr>
      <td>
        <DecoratedAddressLink address={address} plain />
      </td>
      <td>
        <BlockLink blockTag={blockNumber} />
      </td>
      <td>{block && <TimestampAge timestamp={block.timestamp} />}</td>
      {erc721Meta ? (
        <>
          <td>
            <CanBeEmptyText text={erc721Meta.name} />
          </td>
          <td>
            <CanBeEmptyText text={erc721Meta.symbol} />
          </td>
        </>
      ) : (
        <>
          <td></td>
          <td></td>
        </>
      )}
    </tr>
  );
};

export default memo(ERC721Item);
