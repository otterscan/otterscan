import { FC, memo, useContext } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import CanBeEmptyText from "../components/CanBeEmptyText";
import { RuntimeContext } from "../useRuntime";
import { ERC4626ContractMatch, useBlockData } from "../useErigonHooks";

type ERC4626ItemProps = {
  m: ERC4626ContractMatch;
};

const ERC4626Item: FC<ERC4626ItemProps> = ({
  m: { address, blockNumber, name, symbol, decimals, asset, totalAssets },
}) => {
  const { provider } = useContext(RuntimeContext);
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
      <td>
        {totalAssets}
      </td>
    </tr>
  );
};

export default memo(ERC4626Item);
