import { BlockTag } from "@ethersproject/abstract-provider";

export const fourBytesURL = (
  assetsURLPrefix: string,
  fourBytes: string
): string => `${assetsURLPrefix}/signatures/${fourBytes}`;

export const tokenLogoURL = (
  assetsURLPrefix: string,
  address: string
): string => `${assetsURLPrefix}/assets/${address}/logo.png`;

export const blockURL = (blockNum: BlockTag) => `/block/${blockNum}`;

export const blockTxsURL = (blockNum: BlockTag) => `/block/${blockNum}/txs`;

export const sourcifyMetadata = (
  checksummedAddress: string,
  networkId: number
) =>
  `http://localhost:7000/sourcify/contracts/full_match/${networkId}/${checksummedAddress}/metadata.json`;

export const sourcifySourceFile = (
  checksummedAddress: string,
  networkId: number,
  filepath: string
) =>
  `http://localhost:7000/sourcify/contracts/full_match/${networkId}/${checksummedAddress}/sources/${filepath}`;
