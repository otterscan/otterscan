import { FC, memo, useContext } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import CanBeEmptyText from "../components/CanBeEmptyText";
import { RuntimeContext } from "../useRuntime";
import {
  ContractMatch,
  useBlockData,
  useERC20Metadata,
} from "../useErigonHooks";

type ERC20temProps = {
  m: ContractMatch;
};

const ERC20Item: FC<ERC20temProps> = ({ m: { address, blockNumber } }) => {
  const { provider } = useContext(RuntimeContext);
  const erc20meta = useERC20Metadata(provider, address, blockNumber);
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
      {erc20meta ? (
        <>
          <td>
            <CanBeEmptyText text={erc20meta.name} />
          </td>
          <td>
            <CanBeEmptyText text={erc20meta.symbol} />
          </td>
          <td>{erc20meta.decimals}</td>
        </>
      ) : (
        <>
          <td></td>
          <td></td>
          <td></td>
        </>
      )}
    </tr>
  );
};

export default memo(ERC20Item);
