import { useContext, FC, useMemo } from "react";
import GenericTransactionSearchResult from "./GenericTransactionSearchResult";
import { RuntimeContext } from "../../useRuntime";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { AddressAwareComponentProps } from "../types";
import { PAGE_SIZE } from "../../params";
import StandardTHead from "../../components/StandardTHead";
import { usePageTitle } from "../../useTitle";
import BlockProducedItem, { BlockProducedItemProps } from "./BlockProducedItem";

const searchHeader = (
  <StandardTHead>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
  </StandardTHead>
);

const BlocksProduced: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "FeeRecipient", address);
  const results = useGenericTransactionList(
    provider,
    "FeeRecipient",
    address,
    pageNumber,
    PAGE_SIZE,
    total
  );

  const items = useMemo(
    () =>
      results?.results.map(
        (blockProduced): BlockProducedItemProps & { hash: string } => ({
          address,
          blockNumber: blockProduced.blockNumber,
          timestamp:
            results.blocksSummary.get(blockProduced.blockNumber)?.timestamp ??
            0, // TODO: fix get
          hash: blockProduced.blockNumber.toString(),
        })
      ),
    [results]
  );

  usePageTitle(`Blocks Produced | ${address}`);

  return (
    <GenericTransactionSearchResult
      pageNumber={pageNumber}
      total={total}
      items={items}
      Item={(i) => <BlockProducedItem {...i} />}
      header={searchHeader}
      typeName="block"
      columns={2}
    />
  );
};

export default BlocksProduced;
