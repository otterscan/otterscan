import { ethers } from "ethers";

export const fourBytesURL = (
  assetsURLPrefix: string,
  fourBytes: string
): string => `${assetsURLPrefix}/signatures/${fourBytes}`;

export const tokenLogoURL = (
  assetsURLPrefix: string,
  address: string
): string => `${assetsURLPrefix}/assets/${address}/logo.png`;

export const blockURL = (blockNum: ethers.providers.BlockTag) =>
  `/block/${blockNum}`;

export const blockTxsURL = (blockNum: ethers.providers.BlockTag) =>
  `/block/${blockNum}/txs`;
