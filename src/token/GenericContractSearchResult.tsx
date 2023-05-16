import { FC, ReactNode } from "react";
import { commify } from "@ethersproject/units";
import StandardFrame from "../components/StandardFrame";
import StandardSubtitle from "../components/StandardSubtitle";
import ContentFrame from "../components/ContentFrame";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import StandardScrollableTable from "../components/StandardScrollableTable";
import StandardTHead from "../components/StandardTHead";
import StandardTBody from "../components/StandardTBody";
import PageControl from "../search/PageControl";
import { PAGE_SIZE } from "../params";
import { ContractMatch } from "../ots2/usePrototypeHooks";

type GenericContractSearchResultProps<T> = {
  title: string;
  header: ReactNode;
  pageNumber: number;
  total: number | undefined;
  page: T[] | undefined;
  item: FC<T>;
};

const GenericContractSearchResult = <T extends ContractMatch>({
  title,
  header,
  pageNumber,
  total,
  page,
  item: Item,
}: GenericContractSearchResultProps<T>) => (
  <StandardFrame>
    <StandardSubtitle>
      <div className="flex items-baseline space-x-1">
        <span>{title}</span>
      </div>
    </StandardSubtitle>
    <ContentFrame key={pageNumber}>
      <div className="flex items-baseline justify-between py-3">
        <div className="text-sm text-gray-500">
          {page === undefined || total === undefined ? (
            <>Waiting for search results...</>
          ) : (
            <>A total of {commify(total)} contracts found</>
          )}
        </div>
        {total !== undefined && (
          <PageControl
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
          />
        )}
      </div>
      <StandardScrollableTable>
        <StandardTHead>{header}</StandardTHead>
        {page !== undefined ? (
          <StandardSelectionBoundary>
            <StandardTBody>
              {page.map((m) => (
                <Item key={m.address} {...m} />
              ))}
            </StandardTBody>
          </StandardSelectionBoundary>
        ) : (
          // <PendingResults />
          <></>
        )}
      </StandardScrollableTable>
      {page !== undefined && total !== undefined && (
        <div className="flex items-baseline justify-between py-3">
          <div className="text-sm text-gray-500">
            A total of {commify(total)} contracts found
          </div>
          <PageControl
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
          />
        </div>
      )}
    </ContentFrame>
  </StandardFrame>
);

export default GenericContractSearchResult;
