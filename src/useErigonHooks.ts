import { ethers, BigNumber } from "ethers";
import { useState, useEffect } from "react";
import { getInternalOperations } from "./nodeFunctions";
import { TransactionData, InternalOperation } from "./types";

export interface ExtendedBlock extends ethers.providers.Block {
  blockReward: BigNumber;
  unclesReward: BigNumber;
  feeReward: BigNumber;
  size: number;
  sha3Uncles: string;
  stateRoot: string;
  totalDifficulty: BigNumber;
}

export const readBlock = async (
  provider: ethers.providers.JsonRpcProvider,
  blockNumberOrHash: string
) => {
  let blockPromise: Promise<any>;
  if (ethers.utils.isHexString(blockNumberOrHash, 32)) {
    blockPromise = provider.send("eth_getBlockByHash", [
      blockNumberOrHash,
      false,
    ]);
  } else {
    blockPromise = provider.send("eth_getBlockByNumber", [
      blockNumberOrHash,
      false,
    ]);
  }
  const [_rawBlock, _rawIssuance, _rawReceipts] = await Promise.all([
    blockPromise,
    provider.send("erigon_issuance", [blockNumberOrHash]),
    provider.send("eth_getBlockReceipts", [blockNumberOrHash]),
  ]);
  const receipts = (_rawReceipts as any[]).map((r) =>
    provider.formatter.receipt(r)
  );
  const fees = receipts.reduce(
    (acc, r) => acc.add(r.effectiveGasPrice.mul(r.gasUsed)),
    BigNumber.from(0)
  );

  const _block = provider.formatter.block(_rawBlock);
  const extBlock: ExtendedBlock = {
    blockReward: provider.formatter.bigNumber(_rawIssuance.blockReward ?? 0),
    unclesReward: provider.formatter.bigNumber(_rawIssuance.uncleReward ?? 0),
    feeReward: fees,
    size: provider.formatter.number(_rawBlock.size),
    sha3Uncles: _rawBlock.sha3Uncles,
    stateRoot: _rawBlock.stateRoot,
    totalDifficulty: provider.formatter.bigNumber(_rawBlock.totalDifficulty),
    ..._block,
  };
  return extBlock;
};

export const useBlockData = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  blockNumberOrHash: string
) => {
  const [block, setBlock] = useState<ExtendedBlock>();
  useEffect(() => {
    if (!provider) {
      return;
    }

    const _readBlock = async () => {
      const extBlock = await readBlock(provider, blockNumberOrHash);
      setBlock(extBlock);
    };
    _readBlock();
  }, [provider, blockNumberOrHash]);

  return block;
};

export const useInternalOperations = (
  provider: ethers.providers.JsonRpcProvider | undefined,
  txData: TransactionData | undefined
): InternalOperation[] | undefined => {
  const [intTransfers, setIntTransfers] = useState<InternalOperation[]>();

  useEffect(() => {
    const traceTransfers = async () => {
      if (!provider || !txData) {
        return;
      }

      const _transfers = await getInternalOperations(provider, txData);
      for (const t of _transfers) {
        t.from = provider.formatter.address(t.from);
        t.to = provider.formatter.address(t.to);
        t.value = provider.formatter.bigNumber(t.value);
      }
      setIntTransfers(_transfers);
    };
    traceTransfers();
  }, [provider, txData]);

  return intTransfers;
};
