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

export class SearchController {
  // Guaranteed to include all transactions in the starting and ending blocks
  private txs: ProcessedTransaction[];

  private pageStart: number;
  private pageEnd: number;
  public isFirst: boolean;
  public isLast: boolean;
  public startParams: [string, string];

  private constructor(
    readonly address: string,
    txs: ProcessedTransaction[],
    readonly batches: TransactionBatch[],
    // if true, starts at index 0, otherwise considers the "last" parts of the transactions
    boundToStart: boolean,
    startParams: [string, string],
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
      ["first", ""],
    );
  }

  static async middlePage(
    provider: JsonRpcApiProvider,
    address: string,
    hash: string,
    next: boolean,
  ): Promise<SearchController> {
    const prev = !next;
    const tx = await queryClient.fetchQuery(
      getTransactionQuery(provider, hash),
    );

    // See if there are more transactions from this block we must include
    let blockQuery: TransactionChunk | null = null;
    let blockTxs: ProcessedTransaction[] = [];

    if (prev || tx!.blockNumber! > 0) {
      blockQuery = await queryClient.fetchQuery(
        searchTransactionsQuery(
          provider,
          address,
          // We must include the block that `hash` is in
          Math.max(0, tx!.blockNumber! + (next ? 1 : -1)),
          next ? "before" : "after",
        ),
      );
      blockTxs = blockQuery!.txs.filter(
        (blockTx) => blockTx!.blockNumber === tx!.blockNumber,
      );
    }

    let batches: TransactionBatch[] = [];
    let txs: ProcessedTransaction[] = [];

    const txBlockIndex = blockTxs.findIndex((tx) => tx.hash === hash);
    if (txBlockIndex != -1) {
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
          next ? "after" : "before",
        ),
      );
      if (next) {
        // Add transactions from this block
        txs = txs.concat(blockTxs);
        batches.push({
          length: blockTxs.length,
          isFirst: blockQuery!.firstPage,
          isLast:
            pageEndsQuery.txs!.length > 0 &&
            blockTxs[blockTxs.length - 1].hash ===
              pageEndsQuery.txs[pageEndsQuery.txs.length - 1].hash &&
            pageEndsQuery.lastPage,
        });
      } else {
        // Add transactions from this block
        txs = blockTxs.concat(txs);
        batches.unshift({
          length: blockTxs.length,
          isFirst:
            pageEndsQuery.txs!.length > 0 &&
            blockTxs[0].hash === pageEndsQuery.txs[0].hash &&
            pageEndsQuery.firstPage,
          isLast: blockQuery!.lastPage,
        });
      }
    }

    if (
      batches.length === 0 ||
      (next && !batches[batches.length - 1].isLast) ||
      (prev && !batches[0].isFirst)
    ) {
      // TODO: Can we actually infer that this transaction is not null?
      let blockNumber = tx!.blockNumber!;
      if (batches.length > 0) {
        if (next) {
          blockNumber = txs[txs.length - 1].blockNumber;
        } else {
          blockNumber = txs[0].blockNumber;
        }
      }

      const newTxs = await queryClient.fetchQuery(
        searchTransactionsQuery(
          provider,
          address,
          tx!.blockNumber!,
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
      [next ? "next" : "prev", hash],
      next && txIndex != -1 ? txIndex + 1 : undefined,
      prev && txIndex != -1 ? txIndex : undefined,
    );
  }

  static async lastPage(
    provider: JsonRpcApiProvider,
    address: string,
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
      ["last", ""],
    );
  }

  getPage(): ProcessedTransaction[] {
    return this.txs.slice(this.pageStart, this.pageEnd);
  }

  async prevPage(
    provider: JsonRpcApiProvider,
    hash: string,
  ): Promise<SearchController> {
    // Already on this page
    if (this.startParams[0] === "prev" && this.startParams[1] === hash) {
      return this;
    }
    // Ensure we are navigating correctly relative to our current transaction listing
    // I think this tries to prevent navigating multiple times in a row to the same page.
    if (this.txs[this.pageStart].hash === hash) {
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
          ["prev", hash],
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
      const { list: trimmedList, batches: trimmedBatches } = trimBatchesToSize(
        combinedTxList,
        batches,
        PAGE_SIZE,
        true,
        prevPage.txs.length + this.pageEnd - PAGE_SIZE,
      );

      return new SearchController(
        this.address,
        trimmedList,
        trimmedBatches,
        false,
        ["prev", hash],
        undefined,
        prevPage.txs.length + this.pageEnd - PAGE_SIZE,
      );
    }

    return this;
  }

  async nextPage(
    provider: JsonRpcApiProvider,
    hash: string,
  ): Promise<SearchController> {
    // Already on this page
    if (this.startParams[0] === "next" && this.startParams[1] === hash) {
      return this;
    }
    // Ensure we are navigating correctly relative to our current transaction listing
    // I think this tries to prevent navigating multiple times in a row to the same page.
    if (this.txs[this.pageEnd - 1].hash === hash) {
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
          ["next", hash],
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
      // TODO: We *could* save more transactions in memory than PAGE_SIZE,
      // which would lead to quick paging through transactions already
      // downloaded. In order to ensure firstPage is up to date, it's kept to
      // PAGE_SIZE for now.
      const { list: trimmedList, batches: trimmedBatches } = trimBatchesToSize(
        combinedTxList,
        batches,
        PAGE_SIZE,
        false,
        this.pageStart + PAGE_SIZE,
      );
      const txsTrimmed = combinedTxList.length - trimmedList.length;

      return new SearchController(
        this.address,
        trimmedList,
        trimmedBatches,
        true,
        ["next", hash],
        this.pageStart + PAGE_SIZE - txsTrimmed,
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
