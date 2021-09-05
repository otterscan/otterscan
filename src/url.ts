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

const sourcifyRootHash =
  "k51qzi5uqu5dll0ocge71eudqnrgnogmbr37gsgl12uubsinphjoknl6bbi41p";
const ipfsGatewayPrefix = `https://ipfs.io/ipns/${sourcifyRootHash}`;

export const sourcifyMetadata = (
  checksummedAddress: string,
  networkId: number
) =>
  `${ipfsGatewayPrefix}/contracts/full_match/${networkId}/${checksummedAddress}/metadata.json`;

export const sourcifySourceFile = (
  checksummedAddress: string,
  networkId: number,
  filepath: string
) =>
  `${ipfsGatewayPrefix}/contracts/full_match/${networkId}/${checksummedAddress}/sources/${filepath}`;
