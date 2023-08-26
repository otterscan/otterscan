import {
  TransactionResponseParams,
  TransactionReceiptParams,
  LogParams,
  BlockParams,
  makeError,
  Transaction,
  isHexString,
  AccessList,
  accessListify,
  ZeroAddress,
  getAddress,
  dataSlice,
  getCreateAddress,
  toQuantity,
  dataLength,
  zeroPadValue,
  Signature,
} from "ethers";

export type FormatFunc<T> = (value: any) => T;

type FormatObject<T> = {
  [K in keyof T]: T[K] extends FormatFunc<infer U> ? U : never;
};

type BlockParamsWithTransactions = BlockParams & { transactions: ReadonlyArray<TransactionResponseParams> };

class Formatter {
  static formats = {
    block: {
      hash: Formatter.allowNull(Formatter.hash),
      parentHash: Formatter.hash,
      number: Formatter.number,

      timestamp: Formatter.number,
      nonce: Formatter.hex,
      difficulty: Formatter.bigInt,

      gasLimit: Formatter.bigInt,
      gasUsed: Formatter.bigInt,

      miner: Formatter.address,
      extraData: Formatter.data,

      transactions: Formatter.arrayOf(Formatter.hash),

      baseFeePerGas: Formatter.allowNull(Formatter.bigInt),
    },
    receipt: {
      to: Formatter.allowNull(Formatter.address, null),
      from: Formatter.address,
      contractAddress: Formatter.allowNull(Formatter.address, null),
      transactionIndex: Formatter.number,

      // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
      root: Formatter.allowNull(Formatter.hex),
      gasPrice: Formatter.allowNull(Formatter.bigInt, null),
      gasUsed: Formatter.bigInt,
      logsBloom: Formatter.data,
      blockHash: Formatter.hash,
      transactionHash: Formatter.hash,
      logs: Formatter.arrayOf(Formatter.logParams),
      blockNumber: Formatter.number,
      cumulativeGasUsed: Formatter.bigInt,
      effectiveGasPrice: Formatter.allowNull(Formatter.bigInt),
      status: Formatter.allowNull(Formatter.number, null),
      type: Formatter.number,
    },
    receiptLog: {
      transactionIndex: Formatter.number,
      blockNumber: Formatter.number,
      transactionHash: Formatter.hash,
      address: Formatter.address,
      topics: Formatter.arrayOf(Formatter.hash),
      data: Formatter.data,
      logIndex: Formatter.number,
      blockHash: Formatter.hash,
      removed: Formatter.boolean,
    },
    transaction: {
      hash: Formatter.hash,

      type: Formatter.number,
      accessList: Formatter.allowNull(Formatter.accessList, null),

      blockHash: Formatter.allowNull(Formatter.hash, null),
      blockNumber: Formatter.allowNull(Formatter.number, null),
      transactionIndex: Formatter.allowNull(Formatter.number, null),

      confirmations: Formatter.allowNull(Formatter.number, null),

      from: Formatter.address,

      // gasPrice must be set
      // maxPriorityFeePerGas + maxFeePerGas, not necessarily
      gasPrice: Formatter.bigInt,
      maxPriorityFeePerGas: Formatter.allowNull(Formatter.bigInt),
      maxFeePerGas: Formatter.allowNull(Formatter.bigInt),

      gasLimit: Formatter.bigInt,
      to: Formatter.allowNull(Formatter.address, null),
      value: Formatter.bigInt,
      nonce: Formatter.number,
      data: Formatter.data,

      r: Formatter.allowNull(Formatter.uint256),
      s: Formatter.allowNull(Formatter.uint256),
      v: Formatter.allowNull(Formatter.number),

      creates: Formatter.allowNull(Formatter.address, null),

      raw: Formatter.allowNull(Formatter.data),
    },
  };

  static address(value: any): string {
    return getAddress(value);
  }

  // Requires a BigNumberish that is within the IEEE754 safe integer range; returns a number
  // Strict! Used on input.
  static number(number: any): number {
    if (number === "0x") {
      return 0;
    }
    return Number(BigInt(number));
  }

  static bigInt(value: any): bigint {
    return BigInt(value);
  }

  static boolean(value: any): boolean {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      value = value.toLowerCase();
      if (value === "true") {
        return true;
      }
      if (value === "false") {
        return false;
      }
    }
    throw new Error("invalid boolean - " + value);
  }

  // if value is null-ish, nullValue is returned
  static allowNull<T>(
    format: FormatFunc<T>,
    nullValue?: any
  ): FormatFunc<T | typeof nullValue> {
    return function (value: any) {
      if (value === null || value === undefined) {
        return nullValue;
      }
      return format(value);
    };
  }

  // Requires an Array satisfying check
  static arrayOf<T>(format: FormatFunc<T>): FormatFunc<T[]> {
    return function (array: any): T[] {
      if (!Array.isArray(array)) {
        throw new Error("not an array");
      }

      const result: T[] = [];

      array.forEach(function (value) {
        result.push(format(value));
      });

      return result;
    };
  }

  static hex(value: any, strict?: boolean): string {
    if (typeof value === "string") {
      if (!strict && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
      }
      if (isHexString(value)) {
        return value.toLowerCase();
      }
    }
    throw makeError("invalid hash", "INVALID_ARGUMENT", {
      argument: "value",
      value,
    });
  }

  static uint256(value: any): string {
    if (!isHexString(value)) {
      throw makeError("invalid uint256", "INVALID_ARGUMENT", {
        argument: "value",
        value,
      });
    }
    return zeroPadValue(value, 32);
  }

  // Requires a hash, optionally requires 0x prefix; returns prefixed lowercase hash.
  static hash(value: any, strict?: boolean): string {
    const result = Formatter.hex(value, strict);
    if (dataLength(result) !== 32) {
      throw makeError("invalid hash", "INVALID_ARGUMENT", {
        argument: "value",
        value,
      });
    }
    return result;
  }

  static data(value: any, strict?: boolean): string {
    const result = Formatter.hex(value, strict);
    if (result.length % 2 !== 0) {
      throw makeError("invalid data; odd-length", "INVALID_ARGUMENT", {
        argument: "value",
        value,
      });
    }
    return result;
  }

  static check<T extends Record<string, FormatFunc<any>>>(
    format: T,
    object: any
  ): FormatObject<T> {
    const result = {} as FormatObject<T>;
    for (const key in format) {
      try {
        const value = format[key](object[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      } catch (error: any) {
        error.checkKey = key;
        error.checkValue = object[key];
        throw error;
      }
    }
    return result;
  }

  static blockParams(blockObj: any): BlockParams {
    return Formatter.check(Formatter.formats.block, blockObj);
  }

  static blockParamsWithTransactions(blockObj: any): BlockParamsWithTransactions {
    let blockWithTxsFormat = {
      ...Formatter.formats.block,
      transactions: Formatter.arrayOf(Formatter.transactionResponse),
    };
    return Formatter.check(blockWithTxsFormat, blockObj);
  }

  static logParams(receiptLogObj: any): LogParams {
    const nodeLog = Formatter.check(
      Formatter.formats.receiptLog,
      receiptLogObj
    );
    return {
      index: nodeLog.logIndex,
      ...nodeLog,
    };
  }

  static transactionReceiptParams(receiptObj: any): TransactionReceiptParams {
    const nodeReceipt = Formatter.check(Formatter.formats.receipt, receiptObj);
    return {
      hash: nodeReceipt.transactionHash,
      index: nodeReceipt.transactionIndex,
      ...nodeReceipt,
    };
  }

  static accessList(obj: any): AccessList {
    return accessListify(obj || []);
  }

  static transactionResponse(transaction: any): TransactionResponseParams {
    // Rename gas to gasLimit
    if (transaction.gas != null && transaction.gasLimit == null) {
      transaction.gasLimit = transaction.gas;
    }

    // Some clients (TestRPC) do strange things like return 0x0 for the
    // 0 address; correct this to be a real address
    // TODO: Remove this?
    if (transaction.to && BigInt(transaction.to) === 0n) {
      transaction.to = "0x0000000000000000000000000000000000000000";
    }

    // Rename input to data
    if (transaction.input != null && transaction.data == null) {
      transaction.data = transaction.input;
    }

    // Removed in ethers v6
    // If to and creates are empty, populate the creates from the transaction
    /*if (transaction.to == null && transaction.creates == null) {
            transaction.creates = this.contractAddress(transaction);
        }*/

    if (
      (transaction.type === 1 || transaction.type === 2) &&
      transaction.accessList == null
    ) {
      transaction.accessList = [];
    }

    type ParsedTransactionType = FormatObject<
      typeof Formatter.formats.transaction
    >;
    type ParsedResponseType = ParsedTransactionType & {
      index: number;
      chainId: bigint;
      signature: Signature;
    };
    const parsedTx: ParsedTransactionType = Formatter.check(
      this.formats.transaction,
      transaction
    );

    const index = parsedTx.transactionIndex;
    let chainId: bigint;
    if (transaction.chainId != null) {
      chainId = transaction.chainId;

      if (isHexString(chainId)) {
        chainId = BigInt(chainId);
      }
    } else {
      chainId = transaction.networkId;

      // geth-etc returns chainId
      /*
            if (chainId == null && result.v == null) {
                chainId = transaction.chainId;
            }
            */

      if (isHexString(chainId)) {
        chainId = BigInt(chainId);
      }

      // TODO: v shouldn't exist on this type, so double check that removing this doesn't break anything
      /*
            if (typeof(chainId) !== "bigint" && result.v != null) {
                chainId = (result.v - 35) / 2;
                if (chainId < 0) { chainId = 0; }
                chainId = parseInt(chainId);
            }
            */

      if (typeof chainId !== "bigint") {
        chainId = 0n;
      }
    }

    // 0x0000... should actually be null
    // TODO: Remove?
    /*if (result.blockHash && result.blockHash.replace(/0/g, "") === "x") {
            result.blockHash = null;
        }*/

    const signature = Signature.from({
      r: parsedTx.r,
      s: parsedTx.s,
      v: parsedTx.v,
    });
    const result: TransactionResponseParams = {
      ...parsedTx,
      index,
      chainId,
      signature,
    };
    return result;
  }
}

const addressFormat: FormatFunc<string> = Formatter.address;

export const formatter = Formatter;
