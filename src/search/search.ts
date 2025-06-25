import {
  JsonRpcApiProvider,
  TransactionReceiptParams,
  TransactionResponse,
  isAddress,
  isHexString,
} from "ethers";
import {
  ChangeEventHandler,
  FormEventHandler,
  RefObject,
  useRef,
  useState,
} from "react";
import { NavigateFunction, useNavigate } from "react-router";
import useKeyboardShortcut from "use-keyboard-shortcut";
import {
  getOpFeeData,
  isOptimisticChain,
} from "../execution/op-tx-calculation";
import { PAGE_SIZE } from "../params";
import { queryClient } from "../queryClient";
import { ProcessedTransaction, TransactionChunk } from "../types";
import { formatter } from "../utils/formatter";
import { trimBatchesToSize } from "./batch";

export const rawToProcessed = (provider: JsonRpcApiProvider, _rawRes: any) => {
  const _res: TransactionResponse[] = _rawRes.txs.map(
    (t: any) =>
      new TransactionResponse(formatter.transactionResponse(t), provider),
  );

  return {
    txs: _res.map((t, i): ProcessedTransaction => {
      const _rawReceipt = _rawRes.receipts[i];
      const _receipt: TransactionReceiptParams =
        formatter.transactionReceiptParams(_rawReceipt);

      let fee: bigint;
      let gasPrice: bigint;
      if (isOptimisticChain(provider._network.chainId)) {
        const l1Fee: bigint = formatter.bigInt(_rawReceipt.l1Fee ?? 0n);
        ({ fee, gasPrice } = getOpFeeData(
          t.type,
          t.gasPrice!,
          _receipt.gasUsed,
          l1Fee,
        ));
      } else {
        fee = _receipt.gasUsed * t.gasPrice!;
        gasPrice = t.gasPrice!;
      }

      return {
        blockNumber: t.blockNumber!,
        timestamp: formatter.number(_rawReceipt.timestamp),
        idx: _receipt.index,
        hash: t.hash,
        type: t.type,
        from: t.from,
        to: t.to ?? null,
        createdContractAddress: _receipt.contractAddress ?? undefined,
        value: t.value,
        fee,
        gasPrice,
        data: t.data,
        status: _receipt.status!,
      };
    }),
    firstPage: _rawRes.firstPage,
    lastPage: _rawRes.lastPage,
  };
};

export const getTransactionQuery = (
  provider: JsonRpcApiProvider,
  transactionHash: string,
) => ({
  queryKey: ["eth_getTransactionByHash", transactionHash],
  queryFn: () => {
    return provider.getTransaction(transactionHash);
  },
});

export const searchTransactionsQuery = (
  provider: JsonRpcApiProvider,
  address: string,
  baseBlock: number,
  direction: "before" | "after",
): {
  queryKey: [string, string, number];
  queryFn: () => Promise<TransactionChunk>;
} => {
  const method =
    direction === "before"
      ? "ots_searchTransactionsBefore"
      : "ots_searchTransactionsAfter";
  return {
    queryKey: [method, address, baseBlock],
    queryFn: async () => {
      const _rawRes = await provider.send(method, [
        address,
        baseBlock,
        PAGE_SIZE,
      ]);
      return rawToProcessed(provider, _rawRes);
    },
  };
};

interface TransactionBatch {
  length: number;
  isFirst: boolean;
  isLast: boolean;
}

interface StartParams {
  pageType: "next" | "prev" | "first" | "last";
  tx: string | null;
  blockNumber?: number;
}

export class SearchController {
  // Guaranteed to include all transactions in the starting and ending blocks
  private txs: ProcessedTransaction[];
  private pageStart: number;
  private pageEnd: number;
  public isFirst: boolean;
  public isLast: boolean;
  public startParams: StartParams;

  private constructor(
    readonly address: string,
    txs: ProcessedTransaction[],
    readonly batches: TransactionBatch[],
    // if true, starts at index 0, otherwise considers the "last" parts of the transactions
    boundToStart: boolean,
    startParams: StartParams,
    pageStartIndex?: number,
    pageEndIndex?: number,
  ) {
    this.txs = txs;
    if (boundToStart) {
      this.pageStart = pageStartIndex ?? 0;
      this.pageEnd = Math.min(txs.length, this.pageStart + PAGE_SIZE);
    } else {
      this.pageEnd = pageEndIndex ?? txs.length;
      this.pageStart = Math.max(0, this.pageEnd - PAGE_SIZE);
    }

    if (batches.length === 0) {
      throw new Error("SearchController: batches array is empty");
    }

    this.isFirst = this.pageStart === 0 && batches[0].isFirst;
    this.isLast =
      this.pageEnd === txs.length && batches[batches.length - 1].isLast;
    this.startParams = startParams;
  }

  static async firstPage(
    provider: JsonRpcApiProvider,
    address: string,
    startParamsOverride?: StartParams,
  ): Promise<SearchController> {
    const newTxs: TransactionChunk = await queryClient.fetchQuery(
      searchTransactionsQuery(provider, address, 0, "before"),
    );
    return new SearchController(
      address,
      newTxs.txs,
      [
        {
          length: newTxs.txs.length,
          isFirst: newTxs.firstPage,
          isLast: newTxs.lastPage,
        },
      ],
      true,
      startParamsOverride ?? { pageType: "first", tx: null },
    );
  }

  static async middlePage(
    provider: JsonRpcApiProvider,
    address: string,
    hash: string | null,
    next: boolean,
    blockNumberBegin?: number,
  ): Promise<SearchController> {
    const prev = !next;

    const startParams: StartParams = {
      pageType: next ? "next" : "prev",
      tx: hash,
      blockNumber: hash === null ? blockNumberBegin : undefined,
    };

    // See if there are more transactions from this block we must include
    let blockQuery: TransactionChunk | null = null;
    // If a tx hash is provided, only contains transactions in the tx's block
    // If a block number is provided, contains all the transactions from the
    // query
    let blockTxs: ProcessedTransaction[] = [];
    let blockNumber: number;

    // Indicates that the target block number is the first/end
    let blockBatchIsEnd: boolean;

    if (hash !== null) {
      const tx = await queryClient.fetchQuery(
        getTransactionQuery(provider, hash),
      );
      if (tx === null) {
        throw new Error("Transaction " + hash + " not found");
      }
      blockNumber = tx.blockNumber!;

      if (prev || blockNumber > 0) {
        blockQuery = await queryClient.fetchQuery(
          searchTransactionsQuery(
            provider,
            address,
            // We must include the block that `hash` is in
            Math.max(0, blockNumber + (next ? 1 : -1)),
            next ? "before" : "after",
          ),
        );
        blockTxs = blockQuery!.txs.filter(
          (blockTx) => blockTx!.blockNumber === blockNumber,
        );
        blockBatchIsEnd =
          (blockQuery!.txs.length === 0 ||
            blockQuery!.txs[next ? blockQuery!.txs.length - 1 : 0]
              .blockNumber === blockNumber) &&
          (next ? blockQuery!.lastPage : blockQuery!.firstPage);
      } else {
        blockBatchIsEnd = false;
      }
    } else if (blockNumberBegin !== undefined) {
      blockNumber = blockNumberBegin;
      blockQuery = await queryClient.fetchQuery(
        searchTransactionsQuery(
          provider,
          address,
          // We must include the block that `blockNumber` is in
          Math.max(0, blockNumber + (next ? 1 : -1)),
          next ? "before" : "after",
        ),
      );
      blockTxs = blockQuery!.txs;
      if (blockTxs.length === 0) {
        // Start from the beginning
        return next
          ? SearchController.lastPage(provider, address, startParams)
          : SearchController.firstPage(provider, address, startParams);
      }
      blockTxs = blockQuery!.txs;
      blockBatchIsEnd = next ? blockQuery!.lastPage : blockQuery!.firstPage;
    } else {
      throw new Error("Transaction hash or block number not provided");
    }

    let batches: TransactionBatch[] = [];
    let txs: ProcessedTransaction[] = [];

    const txBlockIndex = blockTxs.findIndex((tx) => tx.hash === hash);
    if (
      txBlockIndex != -1 ||
      (hash === null && blockNumberBegin !== undefined && blockTxs.length > 0)
    ) {
      // Make another call to verify whether this is really not the first/last page.
      // This compensates for the behavior in the ots API that if you call
      // ots_searchTransactionsBefore with a very high block number (say,
      // 9999999999 on Hoodi), the response says "firstPage: false" even though
      // the results are exactly those on the first page.
      const pageEndsQuery = await queryClient.fetchQuery(
        searchTransactionsQuery(
          provider,
          address,
          0,
          // If we are navigating to the next page (older transactions), find the
          // oldest transactions (after 0).
          // If we are navigating to the previous page (newer transactions), find
          // the newest transactions (before the latest block, = 0)
          next ? "before" : "after",
        ),
      );
      if (next) {
        // Add transactions from this block
        txs = txs.concat(blockTxs);
        batches.push({
          length: blockTxs.length,
          isFirst:
            pageEndsQuery.txs!.length > 0 &&
            blockTxs[0].hash === pageEndsQuery.txs[0].hash &&
            pageEndsQuery.firstPage,
          isLast: blockBatchIsEnd,
        });
      } else {
        // Add transactions from this block
        txs = blockTxs.concat(txs);
        batches.unshift({
          length: blockTxs.length,
          isFirst: blockBatchIsEnd,
          isLast:
            pageEndsQuery.txs!.length > 0 &&
            blockTxs[blockTxs.length - 1].hash ===
              pageEndsQuery.txs[pageEndsQuery.txs.length - 1].hash &&
            pageEndsQuery.lastPage,
        });
      }
    }

    // If tx hash is specified, add transactions after the tx's block
    if (
      hash !== null &&
      blockNumberBegin === undefined &&
      (batches.length === 0 ||
        (next && !batches[batches.length - 1].isLast) ||
        (prev && !batches[0].isFirst))
    ) {
      const newTxs = await queryClient.fetchQuery(
        searchTransactionsQuery(
          provider,
          address,
          blockNumber,
          next ? "before" : "after",
        ),
      );

      const newBatch: TransactionBatch = {
        length: newTxs.txs.length,
        isFirst: newTxs.firstPage,
        isLast: newTxs.lastPage,
      };

      if (next) {
        // Add (older) transactions to the end
        txs = txs.concat(newTxs.txs);
        batches.push(newBatch);
      } else {
        // Prepend newer transactions
        txs = newTxs.txs.concat(txs);
        batches.unshift(newBatch);
      }
    }

    let txIndex: number = txs.findIndex((tx) => tx.hash === hash);
    return new SearchController(
      address,
      txs,
      batches,
      next,
      startParams,
      next && txIndex != -1 ? txIndex + 1 : undefined,
      prev && txIndex != -1 ? txIndex : undefined,
    );
  }

  static async lastPage(
    provider: JsonRpcApiProvider,
    address: string,
    startParamsOverride?: StartParams,
  ): Promise<SearchController> {
    const newTxs = await queryClient.fetchQuery(
      searchTransactionsQuery(provider, address, 0, "after"),
    );
    return new SearchController(
      address,
      newTxs.txs,
      [
        {
          length: newTxs.txs.length,
          isFirst: newTxs.firstPage,
          isLast: newTxs.lastPage,
        },
      ],
      false,
      startParamsOverride ?? { pageType: "last", tx: null },
    );
  }

  getPage(): ProcessedTransaction[] {
    return this.txs.slice(this.pageStart, this.pageEnd);
  }

  /**
    Returns true if navigating toward `direction` with the given hash is an
    adjacent page navigation.

    @param hash Hash to check
    @param direction Direction of proposed navigation
    @return True if "hash" is on the current page at the `direction` end
  */
  isAdjacentPage(hash: string | null, direction: "next" | "prev") {
    return (
      hash !== null &&
      (direction === "prev"
        ? this.txs[this.pageStart].hash === hash
        : this.txs[this.pageEnd - 1].hash === hash)
    );
  }

  async prevPage(
    provider: JsonRpcApiProvider,
    hash: string | null,
  ): Promise<SearchController> {
    // Already on this page
    if (this.startParams.pageType === "prev" && this.startParams.tx === hash) {
      return this;
    }
    // Ensure we are navigating correctly relative to our current transaction listing
    if (this.isAdjacentPage(hash, "prev")) {
      if (
        this.pageStart - PAGE_SIZE >= 0 ||
        (this.batches.length > 0 && this.batches[0].isFirst)
      ) {
        // We already have all the transactions needed to go back one page
        return new SearchController(
          this.address,
          this.txs,
          this.batches,
          false,
          { pageType: "prev", tx: hash },
          undefined,
          this.pageEnd - (this.pageEnd - this.pageStart),
        );
      }

      // Fetch more transactions
      const baseBlock = this.txs[0].blockNumber;
      const prevPage = await queryClient.fetchQuery(
        searchTransactionsQuery(provider, this.address, baseBlock, "after"),
      );

      const batches = [
        {
          length: prevPage.txs.length,
          isFirst: prevPage.firstPage,
          isLast: prevPage.lastPage,
        },
        ...this.batches,
      ];
      const combinedTxList = prevPage.txs.concat(this.txs);
      // TODO: We *could* save more transactions in memory than PAGE_SIZE,
      // which would lead to quick paging through transactions already
      // downloaded. In order to ensure firstPage is up to date, it's kept to
      // PAGE_SIZE for now.
      const lastPageSize = this.pageEnd - this.pageStart;
      const { list: trimmedList, batches: trimmedBatches } = trimBatchesToSize(
        combinedTxList,
        batches,
        PAGE_SIZE,
        true,
        prevPage.txs.length + this.pageEnd - lastPageSize,
      );

      return new SearchController(
        this.address,
        trimmedList,
        trimmedBatches,
        false,
        { pageType: "prev", tx: hash },
        undefined,
        prevPage.txs.length + this.pageEnd - lastPageSize,
      );
    }

    return this;
  }

  async nextPage(
    provider: JsonRpcApiProvider,
    hash: string | null,
  ): Promise<SearchController> {
    // Already on this page
    if (this.startParams.pageType === "next" && this.startParams.tx === hash) {
      return this;
    }
    // Ensure we are navigating correctly relative to our current transaction listing
    if (this.isAdjacentPage(hash, "next")) {
      if (
        this.pageEnd + PAGE_SIZE <= this.txs.length ||
        (this.batches.length > 0 &&
          this.batches[this.batches.length - 1].isLast)
      ) {
        // We already have all the transactions needed to go forward one page
        return new SearchController(
          this.address,
          this.txs,
          this.batches,
          true,
          { pageType: "next", tx: hash },
          this.pageStart + (this.pageEnd - this.pageStart),
          undefined,
        );
      }

      const baseBlock = this.txs[this.txs.length - 1].blockNumber;
      const nextPage = await queryClient.fetchQuery(
        searchTransactionsQuery(provider, this.address, baseBlock, "before"),
      );

      const batches = [
        ...this.batches,
        {
          length: nextPage.txs.length,
          isFirst: nextPage.firstPage,
          isLast: nextPage.lastPage,
        },
      ];
      const combinedTxList = this.txs.concat(nextPage.txs);
      const lastPageSize = this.pageEnd - this.pageStart;
      // TODO: We *could* save more transactions in memory than PAGE_SIZE,
      // which would lead to quick paging through transactions already
      // downloaded. In order to ensure firstPage is up to date, it's kept to
      // PAGE_SIZE for now.
      const { list: trimmedList, batches: trimmedBatches } = trimBatchesToSize(
        combinedTxList,
        batches,
        PAGE_SIZE,
        false,
        this.pageStart + lastPageSize,
      );
      const txsTrimmed = combinedTxList.length - trimmedList.length;

      return new SearchController(
        this.address,
        trimmedList,
        trimmedBatches,
        true,
        { pageType: "next", tx: hash },
        this.pageStart + lastPageSize - txsTrimmed,
        undefined,
      );
    }

    return this;
  }
}

const doSearch = async (q: string, navigate: NavigateFunction) => {
  const redir = parseSearch(q);
  if (redir !== undefined) {
    navigate(redir);
  }
};

export const parseSearch = (q: string): string | undefined => {
  // Cleanup
  q = q.trim();

  let maybeAddress = q;
  let maybeIndex = "";
  const sepIndex = q.lastIndexOf(":");
  if (sepIndex !== -1) {
    maybeAddress = q.substring(0, sepIndex);
    const afterAddress = q.substring(sepIndex + 1);
    maybeIndex = !isNaN(parseInt(afterAddress))
      ? parseInt(afterAddress).toString()
      : "";
  }

  // Parse URLs for other block explorers
  try {
    const url = new URL(q);
    const pathname = url.pathname.replace(/\/$/, "");

    const addressMatch = pathname.match(/^\/(?:address|token)\/(.*)$/);
    const txMatch = pathname.match(/^\/tx\/(.*)$/);
    const blockMatch = pathname.match(/^\/block\/(\d+)$/);
    const epochMatch = pathname.match(/^\/epoch\/(.*)$/);
    const slotMatch = pathname.match(/^\/slot\/(.*)$/);
    const validatorMatch = pathname.match(/^\/validator\/(.*)$/);
    if (addressMatch) {
      maybeAddress = addressMatch[1];
      // The URL might use a different port number
      maybeIndex = "";
    } else if (txMatch) {
      q = txMatch[1];
    } else if (blockMatch) {
      q = blockMatch[1];
    } else if (epochMatch) {
      q = "epoch:" + epochMatch[1];
    } else if (slotMatch) {
      q = "slot:" + slotMatch[1];
    } else if (validatorMatch) {
      q = "validator:" + validatorMatch[1];
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }

  // Plain address?
  if (isAddress(maybeAddress)) {
    return `/address/${maybeAddress}${maybeIndex !== "" ? `?nonce=${maybeIndex}` : ""}`;
  }

  // Tx hash?
  if (isHexString(q, 32)) {
    return `/tx/${q}`;
  }

  // Block number?
  const blockNumber = parseInt(q);
  if (!isNaN(blockNumber)) {
    return `/block/${blockNumber}`;
  }

  // Epoch?
  if (q.startsWith("epoch:")) {
    const mayBeEpoch = q.substring(6);
    const epoch = parseInt(mayBeEpoch);
    if (!isNaN(epoch)) {
      return `/epoch/${epoch}`;
    }
  }

  // Slot?
  if (q.startsWith("slot:")) {
    const mayBeSlot = q.substring(5);
    const slot = parseInt(mayBeSlot);
    if (!isNaN(slot)) {
      return `/slot/${slot}`;
    }
  }

  // Validator?
  if (q.startsWith("validator:")) {
    const mayBeValidator = q.substring(10);

    // Validator by index
    if (mayBeValidator.match(/^\d+$/)) {
      const validatorIndex = parseInt(mayBeValidator);
      return `/validator/${validatorIndex}`;
    }

    // Validator by public key
    if (mayBeValidator.length === 98 && isHexString(mayBeValidator, 48)) {
      return `/validator/${mayBeValidator}`;
    }
  }

  // Assume it is an ENS name
  return `/address/${maybeAddress}${maybeIndex !== "" ? `?nonce=${maybeIndex}` : ""}`;
};

export const useGenericSearch = (): [
  RefObject<HTMLInputElement>,
  ChangeEventHandler<HTMLInputElement>,
  FormEventHandler<HTMLFormElement>,
] => {
  const [searchString, setSearchString] = useState<string>("");
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchTerm = e.target.value.trim();
    setCanSubmit(searchTerm.length > 0);
    setSearchString(searchTerm);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    if (searchRef.current) {
      searchRef.current.value = "";
    }
    doSearch(searchString, navigate);
  };

  const searchRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcut(
    ["/"],
    () => {
      searchRef.current?.focus();
    },
    {
      overrideSystem: true,
    },
  );

  return [searchRef, handleChange, handleSubmit];
};
