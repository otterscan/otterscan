import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import Blockies from "react-blockies";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import Copy from "./components/Copy";
import ContentFrame from "./ContentFrame";
import UndefinedPageControl from "./search/UndefinedPageControl";
import ResultHeader from "./search/ResultHeader";
import PendingResults from "./search/PendingResults";
import TransactionItem from "./search/TransactionItem";
import { SearchController } from "./search/search";
import { useFeeToggler } from "./search/useFeeToggler";
import { ethers } from "ethers";

type BlockParams = {
  address: string;
  direction?: string;
};

type PageParams = {
  p?: number;
};

const AddressTransactions: React.FC = () => {
  const params = useParams<BlockParams>();
  const location = useLocation<PageParams>();
  const history = useHistory();
  const qs = queryString.parse(location.search);
  let hash: string | undefined;
  if (qs.h) {
    hash = qs.h as string;
  }

  // Normalize to checksummed address
  const checksummedAddress = useMemo(
    () => ethers.utils.getAddress(params.address),
    [params.address]
  );
  if (params.address !== checksummedAddress) {
    console.log("NORMALIZE");
    history.replace(
      `/address/${checksummedAddress}${
        params.direction ? "/" + params.direction : ""
      }${location.search}`
    );
  }

  const [controller, setController] = useState<SearchController>();
  useEffect(() => {
    const readFirstPage = async () => {
      const _controller = await SearchController.firstPage(checksummedAddress);
      setController(_controller);
    };
    const readMiddlePage = async (next: boolean) => {
      const _controller = await SearchController.middlePage(
        checksummedAddress,
        hash!,
        next
      );
      setController(_controller);
    };
    const readLastPage = async () => {
      const _controller = await SearchController.lastPage(checksummedAddress);
      setController(_controller);
    };
    const prevPage = async () => {
      const _controller = await controller!.prevPage(hash!);
      setController(_controller);
    };
    const nextPage = async () => {
      const _controller = await controller!.nextPage(hash!);
      setController(_controller);
    };

    // Page load from scratch
    if (params.direction === "first" || params.direction === undefined) {
      if (!controller?.isFirst || controller.address !== checksummedAddress) {
        readFirstPage();
      }
    } else if (params.direction === "prev") {
      if (controller && controller.address === checksummedAddress) {
        prevPage();
      } else {
        readMiddlePage(false);
      }
    } else if (params.direction === "next") {
      if (controller && controller.address === checksummedAddress) {
        nextPage();
      } else {
        readMiddlePage(true);
      }
    } else if (params.direction === "last") {
      if (!controller?.isLast || controller.address !== checksummedAddress) {
        readLastPage();
      }
    }
  }, [checksummedAddress, params.direction, hash, controller]);

  const page = useMemo(() => controller?.getPage(), [controller]);

  document.title = `Address ${params.address} | Otterscan`;

  const [feeDisplay, feeDisplayToggler] = useFeeToggler();

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex space-x-2 items-baseline">
          <Blockies
            className="self-center rounded"
            seed={params.address.toLowerCase()}
            scale={3}
          />
          <span>Address</span>
          <span className="font-address text-base text-gray-500">
            {params.address}
          </span>
          <Copy value={params.address} rounded />
        </div>
      </StandardSubtitle>
      <ContentFrame>
        <div className="flex justify-between items-baseline py-3">
          <div className="text-sm text-gray-500">
            {page === undefined ? (
              <>Waiting for search results...</>
            ) : (
              <>{page.length} transactions on this page</>
            )}
          </div>
          <UndefinedPageControl
            address={params.address}
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
        {controller ? (
          <>
            {controller.getPage().map((tx) => (
              <TransactionItem
                key={tx.hash}
                tx={tx}
                selectedAddress={params.address}
                feeDisplay={feeDisplay}
              />
            ))}
            <div className="flex justify-between items-baseline py-3">
              <div className="text-sm text-gray-500">
                {page !== undefined && (
                  <>{page.length} transactions on this page</>
                )}
              </div>
              <UndefinedPageControl
                address={params.address}
                isFirst={controller.isFirst}
                isLast={controller.isLast}
                prevHash={page ? page[0].hash : ""}
                nextHash={page ? page[page.length - 1].hash : ""}
              />
            </div>
          </>
        ) : (
          <PendingResults />
        )}
      </ContentFrame>
    </StandardFrame>
  );
};

export default React.memo(AddressTransactions);
