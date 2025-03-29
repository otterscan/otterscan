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

export class SearchController {
  // Guaranteed to include all transactions in the starting and ending blocks
  private txs: ProcessedTransaction[];

  private pageStart: number;
  private pageEnd: number;
  public isFirst: boolean;
  public isLast: boolean;

  private constructor(
    readonly address: string,
    txs: ProcessedTransaction[],
    readonly isBatchFirst: boolean,
    readonly isBatchLast: boolean,
    // if true, starts at index 0, otherwise considers the "last" parts of the transactions
    boundToStart: boolean,
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

    if (isBatchFirst && this.pageStart === 0) {
      this.isFirst = true;
    } else {
      this.isFirst = false;
    }
    if (isBatchLast && this.pageEnd === txs.length) {
      this.isLast = true;
    } else {
      this.isLast = false;
    }
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
      newTxs.firstPage,
      newTxs.lastPage,
      true,
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
          Math.max(0, tx!.blockNumber! + (next ? -1 : 1)),
          next ? "before" : "after",
        ),
      );
      blockTxs = blockQuery!.txs.filter(
        (blockTx) => blockTx!.blockNumber === tx!.blockNumber,
      );
    }

    let txs: ProcessedTransaction[] = [];

    const txBlockIndex = blockTxs.findIndex((tx) => tx.hash === hash);
    if (txBlockIndex != -1) {
      if (next) {
        // Add transactions after `hash` in the block
        txs = txs.concat(blockTxs.slice(txBlockIndex + 1));
      } else {
        // Add transactions before `hash` in the block
        txs = blockTxs.slice(0, Math.max(0, txBlockIndex - 1)).concat(txs);
      }
    }

    // TODO: Can we actually infer that this transaction is not null?
    const newTxs = await queryClient.fetchQuery(
      searchTransactionsQuery(
        provider,
        address,
        tx!.blockNumber!,
        next ? "before" : "after",
      ),
    );
    if (next) {
      // Add (older) transactions to the end
      txs = txs.concat(newTxs.txs);
    } else {
      // Prepend newer transactions
      txs = newTxs.txs.concat(txs);
    }

    let txIndex: number = txs.findIndex((tx) => tx.hash === hash);

    let firstPage = newTxs.firstPage;
    let lastPage = newTxs.lastPage;
    if (txBlockIndex >= 0) {
      if (next && txBlockIndex > 0) {
        firstPage = false;
      } else if (prev && txBlockIndex < blockTxs.length - 1) {
        lastPage = false;
      }
    }

    return new SearchController(
      address,
      txs,
      firstPage,
      lastPage,
      next,
      next && txIndex != -1 ? txIndex + 1 : undefined,
      prev && txIndex != -1 ? txIndex - 1 : undefined,
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
      newTxs.firstPage,
      newTxs.lastPage,
      false,
    );
  }

  getPage(): ProcessedTransaction[] {
    return this.txs.slice(this.pageStart, this.pageEnd);
  }

  async prevPage(
    provider: JsonRpcApiProvider,
    hash: string,
  ): Promise<SearchController> {
    // TODO: What's the purpose of this check?
    if (this.txs[this.pageStart].hash === hash) {
      if (this.pageStart - PAGE_SIZE >= 0) {
        // We already have all the transactions needed to go back one page
        return new SearchController(
          this.address,
          this.txs,
          this.isBatchFirst,
          this.isBatchLast,
          false,
          undefined,
          this.pageEnd - PAGE_SIZE,
        );
      }

      // Fetch more transactions
      // TODO: Trim transactions beyond current block
      const baseBlock = this.txs[0].blockNumber;
      const prevPage = await queryClient.fetchQuery(
        searchTransactionsQuery(provider, this.address, baseBlock, "after"),
      );
      return new SearchController(
        this.address,
        prevPage.txs.concat(this.txs),
        prevPage.firstPage,
        prevPage.lastPage,
        false,
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
    // TODO: What's the purpose of this check?
    if (this.txs[this.pageEnd - 1].hash === hash) {
      if (this.pageEnd + PAGE_SIZE <= this.txs.length) {
        // We already have all the transactions needed to go back one page
        return new SearchController(
          this.address,
          this.txs,
          this.isBatchFirst,
          this.isBatchLast,
          true,
          this.pageStart + PAGE_SIZE,
          undefined,
        );
      }

      const baseBlock = this.txs[this.txs.length - 1].blockNumber;
      const nextPage = await queryClient.fetchQuery(
        searchTransactionsQuery(provider, this.address, baseBlock, "before"),
      );
      return new SearchController(
        this.address,
        this.txs.concat(nextPage.txs),
        nextPage.firstPage,
        nextPage.lastPage,
        true,
        this.pageStart + PAGE_SIZE,
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
