import { FC, memo, useContext } from "react";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import { RuntimeContext } from "../useRuntime";
import { ContractMatch, useBlockData, useERC1167Impl } from "../useErigonHooks";

type ERC1167ItemProps = {
  m: ContractMatch;
};

const ERC1167Item: FC<ERC1167ItemProps> = ({ m: { address, blockNumber } }) => {
  const { provider } = useContext(RuntimeContext);
  const erc1167Impl = useERC1167Impl(provider, address);
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
      {erc1167Impl ? (
        <td>
          <DecoratedAddressLink address={erc1167Impl} />
        </td>
      ) : (
        <td></td>
      )}
    </tr>
  );
};

export default memo(ERC1167Item);
