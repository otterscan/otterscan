import React, { useContext, useMemo } from "react";
import ContentFrame from "../ContentFrame";
import PendingApprovals from "./PendingApprovals";
import AllowanceAmount from "../components/AllowanceAmount";
import TransactionAddress from "../components/TransactionAddress";
import { SelectionContext, useSelection } from "../useSelection";
import { useMultipleETHUSDOracle } from "../usePriceOracle";
import { RuntimeContext } from "../useRuntime";
import { ChecksummedAddress } from "../types";
import { useContractsMetadata } from "../hooks";
import { useAllowances, useApprovals } from "../useErigonHooks";
import { BlockNumberContext } from "../useBlockTagContext";

type AddressTransactionResultsProps = {
  address: ChecksummedAddress;
};

const AddressTransactionResults: React.FC<AddressTransactionResultsProps> = ({
  address,
}) => {
  const { provider } = useContext(RuntimeContext);
  const selectionCtx = useSelection();

  const approvals = useApprovals(provider, address);
  const allowances = useAllowances(provider, address, approvals);
  console.log(approvals);
  console.log(address);

  const priceMap = useMultipleETHUSDOracle(provider, ["latest"]);

  // Calculate Sourcify metadata for all addresses that appear on this page results
  const addresses = useMemo(() => {
    const _addresses = [address];
    if (approvals) {
      for (const t of approvals) {
        _addresses.push(t.token);
        _addresses.push(t.spender);
      }
    }
    return _addresses;
  }, [address, approvals]);
  const metadatas = useContractsMetadata(addresses, provider);

  return (
    <ContentFrame tabs>
      <SelectionContext.Provider value={selectionCtx}>
        <BlockNumberContext.Provider value="latest">
          <div className="grid grid-cols-12 gap-x-1 bg-gray-100 border-t border-b border-gray-200 px-2 py-2 font-bold text-gray-500 text-sm mt-3">
            <div className="col-span-5">Spender</div>
            <div className="col-span-5">Allowance</div>
            <div className="col-span-2">Action</div>
          </div>
          {approvals ? (
            <>
              {approvals.map((a) => (
                <div
                  key={a.token + a.spender}
                  className="grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 hover:bg-skin-table-hover px-2 py-3"
                >
                  <span className="col-span-5 flex items-baseline">
                    <TransactionAddress address={a.spender} showCodeIndicator />
                  </span>
                  {allowances?.[a.token]?.[a.spender] && (
                    <span className="col-span-5 flex items-baseline">
                      <AllowanceAmount value={allowances[a.token][a.spender]} />
                      <TransactionAddress address={a.token} />
                    </span>
                  )}
                  <span className="col-span-2 flex items-baseline">Revoke</span>
                </div>
              ))}
            </>
          ) : (
            <PendingApprovals />
          )}
        </BlockNumberContext.Provider>
      </SelectionContext.Provider>
    </ContentFrame>
  );
};

export default AddressTransactionResults;
