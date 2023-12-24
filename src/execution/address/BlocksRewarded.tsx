import { FC, useContext, useMemo } from "react";
import StandardTHead from "../../components/StandardTHead";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { PAGE_SIZE } from "../../params";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import { AddressAwareComponentProps } from "../types";
import BlockRewardedItem, { BlockRewardedItemProps } from "./BlockRewardedItem";
import GenericTransactionSearchResult from "./GenericTransactionSearchResult";

const searchHeader = (
  <StandardTHead>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
  </StandardTHead>
);

const BlocksRewarded: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "BlocksRewarded", address);
  const results = useGenericTransactionList(
    provider,
    "BlocksRewarded",
    address,
    pageNumber,
    PAGE_SIZE,
    total,
  );

  const items = useMemo(
    () =>
      results?.results.map(
        (BlockRewarded): BlockRewardedItemProps & { hash: string } => ({
          address,
          blockNumber: BlockRewarded.blockNumber,
          timestamp:
            results.blocksSummary.get(BlockRewarded.blockNumber)?.timestamp ??
            0, // TODO: fix get
          hash: BlockRewarded.blockNumber.toString(),
        }),
      ),
    [results],
  );

  usePageTitle(`Blocks Rewarded | ${address}`);

  return (
    <GenericTransactionSearchResult
      pageNumber={pageNumber}
      total={total}
      items={items}
      Item={(i) => <BlockRewardedItem {...i} />}
      header={searchHeader}
      typeName="block"
      columns={2}
    />
  );
};

export default BlocksRewarded;
