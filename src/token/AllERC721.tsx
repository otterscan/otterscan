import { useMemo, useContext, FC } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import StandardFrame from "../StandardFrame";
import StandardSubtitle from "../StandardSubtitle";
import ContentFrame from "../ContentFrame";
import StandardTable from "../components/StandardTable";
import StandardTHead from "../components/StandardTHead";
import StandardTBody from "../components/StandardTBody";
import PageControl from "../search/PageControl";
import ERC721Item from "./ERC721Item";
import { RuntimeContext } from "../useRuntime";
import {
  useBlockTransactions,
  useERC721Count,
  useERC721List,
} from "../useErigonHooks";
import { SelectionContext, useSelection } from "../useSelection";
import { PAGE_SIZE } from "../params";

const AllERC721: FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams();

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const total = useERC721Count(provider);
  const page = useERC721List(provider, pageNumber, PAGE_SIZE);
  const selectionCtx = useSelection();

  // const blockNumber = useMemo(
  //   () => BigNumber.from(params.blockNumber),
  //   [params.blockNumber]
  // );

  // const [totalTxs, txs] = useBlockTransactions(
  //   provider,
  //   blockNumber.toNumber(),
  //   pageNumber - 1,
  //   PAGE_SIZE
  // );

  document.title = `ERC721 Tokens | Otterscan`;

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex space-x-1 items-baseline">
          <span>ERC721 tokens</span>
        </div>
      </StandardSubtitle>
      <ContentFrame key={pageNumber}>
        <div className="flex justify-between items-baseline py-3">
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
        <StandardTable>
          <StandardTHead>
            <th className="w-96">Address</th>
            <th className="w-28">Block</th>
            <th className="w-40">Age</th>
            <th>Name</th>
            <th>Symbol</th>
          </StandardTHead>
          {page !== undefined ? (
            <SelectionContext.Provider value={selectionCtx}>
              <StandardTBody>
                {page.map((m) => (
                  <ERC721Item key={m.address} m={m} />
                ))}
              </StandardTBody>
            </SelectionContext.Provider>
          ) : (
            // <PendingResults />
            <></>
          )}
        </StandardTable>
        {page !== undefined && total !== undefined && (
          <div className="flex justify-between items-baseline py-3">
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
      {/* <BlockTransactionHeader blockTag={blockNumber.toNumber()} />
      <BlockTransactionResults
        page={txs}
        total={totalTxs ?? 0}
        pageNumber={pageNumber}
      /> */}
    </StandardFrame>
  );
};

export default AllERC721;
