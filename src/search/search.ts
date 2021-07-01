import { ethers } from "ethers";
import { provider } from "../ethersconfig";
import { PAGE_SIZE } from "../params";
import { ProcessedTransaction, TransactionChunk } from "../types";

export class SearchController {
  private txs: ProcessedTransaction[];

  private pageStart: number;

  private pageEnd: number;

  private constructor(
    readonly address: string,
    txs: ProcessedTransaction[],
    readonly isFirst: boolean,
    readonly isLast: boolean,
    boundToStart: boolean
  ) {
    this.txs = txs;
    if (boundToStart) {
      this.pageStart = 0;
      this.pageEnd = Math.min(txs.length, PAGE_SIZE);
    } else {
      this.pageEnd = txs.length;
      this.pageStart = Math.max(0, txs.length - PAGE_SIZE);
    }
  }

  private static rawToProcessed = (_rawRes: any) => {
    const _res: ethers.providers.TransactionResponse[] = _rawRes.txs.map(
      (t: any) => provider.formatter.transactionResponse(t)
    );

    return {
      txs: _res.map((t, i): ProcessedTransaction => {
        const _rawReceipt = _rawRes.receipts[i];
        const _receipt = provider.formatter.receipt(_rawReceipt);
        return {
          blockNumber: t.blockNumber!,
          timestamp: provider.formatter.number(_rawReceipt.timestamp),
          idx: _receipt.transactionIndex,
          hash: t.hash,
          from: t.from,
          to: t.to,
          value: t.value,
          fee: _receipt.gasUsed.mul(t.gasPrice!),
          gasPrice: t.gasPrice!,
          data: t.data,
          status: _receipt.status!,
        };
      }),
      firstPage: _rawRes.firstPage,
      lastPage: _rawRes.lastPage,
    };
  };

  private static async readBackPage(
    address: string,
    baseBlock: number
  ): Promise<TransactionChunk> {
    const _rawRes = await provider.send("ots_searchTransactionsBefore", [
      address,
      baseBlock,
      PAGE_SIZE,
    ]);
    return this.rawToProcessed(_rawRes);
  }

  private static async readForwardPage(
    address: string,
    baseBlock: number
  ): Promise<TransactionChunk> {
    const _rawRes = await provider.send("ots_searchTransactionsAfter", [
      address,
      baseBlock,
      PAGE_SIZE,
    ]);
    return this.rawToProcessed(_rawRes);
  }

  static async firstPage(address: string): Promise<SearchController> {
    const newTxs = await SearchController.readBackPage(address, 0);
    return new SearchController(
      address,
      newTxs.txs,
      newTxs.firstPage,
      newTxs.lastPage,
      true
    );
  }

  static async middlePage(
    address: string,
    hash: string,
    next: boolean
  ): Promise<SearchController> {
    const tx = await provider.getTransaction(hash);
    const newTxs = next
      ? await SearchController.readBackPage(address, tx.blockNumber!)
      : await SearchController.readForwardPage(address, tx.blockNumber!);
    return new SearchController(
      address,
      newTxs.txs,
      newTxs.firstPage,
      newTxs.lastPage,
      next
    );
  }

  static async lastPage(address: string): Promise<SearchController> {
    const newTxs = await SearchController.readForwardPage(address, 0);
    return new SearchController(
      address,
      newTxs.txs,
      newTxs.firstPage,
      newTxs.lastPage,
      false
    );
  }

  getPage(): ProcessedTransaction[] {
    return this.txs.slice(this.pageStart, this.pageEnd);
  }

  async prevPage(hash: string): Promise<SearchController> {
    // Already on this page
    if (this.txs[this.pageEnd - 1].hash === hash) {
      return this;
    }

    if (this.txs[this.pageStart].hash === hash) {
      const overflowPage = this.txs.slice(0, this.pageStart);
      const baseBlock = this.txs[0].blockNumber;
      const prevPage = await SearchController.readForwardPage(
        this.address,
        baseBlock
      );
      return new SearchController(
        this.address,
        prevPage.txs.concat(overflowPage),
        prevPage.firstPage,
        prevPage.lastPage,
        false
      );
    }

    return this;
  }

  async nextPage(hash: string): Promise<SearchController> {
    // Already on this page
    if (this.txs[this.pageStart].hash === hash) {
      return this;
    }

    if (this.txs[this.pageEnd - 1].hash === hash) {
      const overflowPage = this.txs.slice(this.pageEnd);
      const baseBlock = this.txs[this.txs.length - 1].blockNumber;
      const nextPage = await SearchController.readBackPage(
        this.address,
        baseBlock
      );
      return new SearchController(
        this.address,
        overflowPage.concat(nextPage.txs),
        nextPage.firstPage,
        nextPage.lastPage,
        true
      );
    }

    return this;
  }
}
