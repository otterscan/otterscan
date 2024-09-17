import { FC, useContext, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import StandardTHead from "../../components/StandardTHead";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { PAGE_SIZE } from "../../params";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import { type AddressOutletContext } from "../AddressMainPage";
import GenericTransactionSearchResult from "./GenericTransactionSearchResult";
import WithdrawalItem, { WithdrawalItemProps } from "./WithdrawalItem";

const withdrawalSearchHeader = (
  <StandardTHead>
    <th className="w-28">Index</th>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
    <th className="w-32">Validator</th>
    <th className="w-52">To</th>
    <th className="w-44">Value</th>
  </StandardTHead>
);

const AddressWithdrawalsResults: FC = () => {
  const { address } = useOutletContext() as AddressOutletContext;
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "Withdrawals", address);
  const results = useGenericTransactionList(
    provider,
    "Withdrawals",
    address,
    pageNumber,
    PAGE_SIZE,
    total,
  );

  const items = useMemo(
    () =>
      results?.results.map(
        (withdrawal): WithdrawalItemProps & { hash: string } => ({
          address,
          index: withdrawal.index,
          blockNumber: withdrawal.blockNumber,
          timestamp:
            results.blocksSummary.get(withdrawal.blockNumber)?.timestamp ?? 0, // TODO: fix get
          validatorIndex: withdrawal.validatorIndex,
          amount: withdrawal.amount,
          hash: withdrawal.index.toString(),
        }),
      ),
    [results],
  );

  usePageTitle(`Withdrawals | ${address}`);

  return (
    <GenericTransactionSearchResult
      pageNumber={pageNumber}
      total={total}
      items={items}
      Item={(i) => <WithdrawalItem {...i} />}
      header={withdrawalSearchHeader}
      typeName="withdrawal"
      columns={6}
    />
  );
};

export default AddressWithdrawalsResults;
