import React from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";
import { ResolvedAddresses } from "../api/address-resolver";
import ContentFrame from "../ContentFrame";
import PendingResults from "../search/PendingResults";
import ResultHeader from "../search/ResultHeader";
import { SearchController } from "../search/search";
import TransactionItem from "../search/TransactionItem";
import UndefinedPageControl from "../search/UndefinedPageControl";
import { FeeDisplay } from "../search/useFeeToggler";
import { ProcessedTransaction } from "../types";
import { SelectionContext, useSelection } from "../useSelection";
import { Metadata } from "../useSourcify";

type AddressTransactionResultsProps = {
  page: ProcessedTransaction[] | undefined;
  checksummedAddress: string;
  controller: SearchController | undefined;
  feeDisplay: FeeDisplay;
  feeDisplayToggler: () => void;
  resolvedAddresses: ResolvedAddresses | undefined;
  priceMap: Record<BlockTag, BigNumber>;
  metadatas: Record<string, Metadata | null | undefined>;
};

const AddressTransactionResults: React.FC<AddressTransactionResultsProps> = ({
  page,
  checksummedAddress,
  controller,
  feeDisplay,
  feeDisplayToggler,
  resolvedAddresses,
  priceMap,
  metadatas,
}) => {
  const selectionCtx = useSelection();

  return (
    <ContentFrame tabs>
      <div className="flex justify-between items-baseline py-3">
        <div className="text-sm text-gray-500">
          {page === undefined ? (
            <>Waiting for search results...</>
          ) : (
            <>{page.length} transactions on this page</>
          )}
        </div>
        <UndefinedPageControl
          address={checksummedAddress}
          isFirst={controller?.isFirst}
          isLast={controller?.isLast}
          prevHash={page ? page[0].hash : ""}
          nextHash={page ? page[page.length - 1].hash : ""}
          disabled={controller === undefined}
        />
      </div>
      <ResultHeader
        feeDisplay={feeDisplay}
        feeDisplayToggler={feeDisplayToggler}
      />
      {page ? (
        <SelectionContext.Provider value={selectionCtx}>
          {page.map((tx) => (
            <TransactionItem
              key={tx.hash}
              tx={tx}
              resolvedAddresses={resolvedAddresses}
              selectedAddress={checksummedAddress}
              feeDisplay={feeDisplay}
              priceMap={priceMap}
              metadatas={metadatas}
            />
          ))}
          <div className="flex justify-between items-baseline py-3">
            <div className="text-sm text-gray-500">
              {page === undefined ? (
                <>Waiting for search results...</>
              ) : (
                <>{page.length} transactions on this page</>
              )}
            </div>
            <UndefinedPageControl
              address={checksummedAddress}
              isFirst={controller?.isFirst}
              isLast={controller?.isLast}
              prevHash={page ? page[0].hash : ""}
              nextHash={page ? page[page.length - 1].hash : ""}
              disabled={controller === undefined}
            />
          </div>
        </SelectionContext.Provider>
      ) : (
        <PendingResults />
      )}
    </ContentFrame>
  );
};

export default AddressTransactionResults;
