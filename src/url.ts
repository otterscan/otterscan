import { BlockTag } from "@ethersproject/abstract-provider";
import { ChecksummedAddress } from "./types";

export const fourBytesURL = (
  assetsURLPrefix: string,
  fourBytes: string
): string => `${assetsURLPrefix}/signatures/${fourBytes}`;

export const topic0URL = (assetsURLPrefix: string, topic0: string): string =>
  `${assetsURLPrefix}/topic0/${topic0}`;

export const tokenLogoURL = (
  assetsURLPrefix: string,
  address: string
): string => `${assetsURLPrefix}/assets/${address}/logo.png`;

export const blockURL = (blockNum: BlockTag) => `/block/${blockNum}`;

export const blockTxsURL = (blockNum: BlockTag) => `/block/${blockNum}/txs`;

export enum SourcifySource {
  // Resolve trusted IPNS for root IPFS
  IPFS_IPNS,

  // Centralized Sourcify servers
  CENTRAL_SERVER,
}

const sourcifyIPNS =
  "k51qzi5uqu5dll0ocge71eudqnrgnogmbr37gsgl12uubsinphjoknl6bbi41p";
const defaultIpfsGatewayPrefix = `https://ipfs.io/ipns/${sourcifyIPNS}`;
const sourcifyHttpRepoPrefix = `https://repo.sourcify.dev`;

const resolveSourcifySource = (source: SourcifySource) => {
  if (source === SourcifySource.IPFS_IPNS) {
    return defaultIpfsGatewayPrefix;
  }
  if (source === SourcifySource.CENTRAL_SERVER) {
    return sourcifyHttpRepoPrefix;
  }

  throw new Error(`Unknown Sourcify integration source code: ${source}`);
};

export const sourcifyMetadata = (
  address: ChecksummedAddress,
  chainId: number,
  source: SourcifySource
) =>
  `${resolveSourcifySource(
    source
  )}/contracts/full_match/${chainId}/${address}/metadata.json`;

export const sourcifySourceFile = (
  address: ChecksummedAddress,
  chainId: number,
  filepath: string,
  source: SourcifySource
) =>
  `${resolveSourcifySource(
    source
  )}/contracts/full_match/${chainId}/${address}/sources/${filepath}`;

export const openInRemixURL = (checksummedAddress: string, networkId: number) =>
  `https://remix.ethereum.org/#call=source-verification//fetchAndSave//${checksummedAddress}//${networkId}`;
