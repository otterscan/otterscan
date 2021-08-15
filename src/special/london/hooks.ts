import { JsonRpcProvider } from "@ethersproject/providers";
import { isHexString } from "@ethersproject/bytes";
import { ChartBlock } from "./chart";

export const readBlockForDashboard = async (
  provider: JsonRpcProvider,
  blockNumberOrHash: string
): Promise<ChartBlock> => {
  let blockPromise: Promise<any>;
  if (isHexString(blockNumberOrHash, 32)) {
    // TODO: fix
    blockPromise = provider.send("eth_getBlockByHash", [
      blockNumberOrHash,
      false,
    ]);
  } else {
    blockPromise = provider.send("ots_getDashboardBlockDetails", [
      blockNumberOrHash,
    ]);
  }

  const _rawBlock = await blockPromise;
  const _block = provider.formatter.block(_rawBlock.block);
  const _rawIssuance = _rawBlock.issuance;

  const extBlock: ChartBlock = {
    blockReward: provider.formatter.bigNumber(_rawIssuance.blockReward ?? 0),
    feeReward: provider.formatter.bigNumber(_rawBlock.totalFees),
    totalIssued: provider.formatter.bigNumber(_rawBlock.totalIssued),
    totalBurnt: provider.formatter.bigNumber(_rawBlock.totalBurnt),
    ..._block,
  };
  return extBlock;
};
