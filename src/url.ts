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
  chainId: number,
  address: string
): string => `${assetsURLPrefix}/assets/${chainId}/${address}/logo.png`;

export const chainInfoURL = (
  assetsURLPrefix: string,
  chainId: number
): string => `${assetsURLPrefix}/chains/eip155-${chainId}.json`;

export const blockURL = (blockNum: BlockTag) => `/block/${blockNum}`;

export const blockTxsURL = (blockNum: BlockTag) => `/block/${blockNum}/txs`;

export const transactionURL = (txHash: string) => `/tx/${txHash}`;

export const addressByNonceURL = (address: ChecksummedAddress, nonce: number) =>
  `/address/${address}?nonce=${nonce}`;

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

/**
 * Builds a complete Sourcify metadata.json URL given the contract address
 * and chain.
 */
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
  `https://remix.ethereum.org/#activate=sourcify&call=sourcify//fetchAndSave//${checksummedAddress}//${networkId}`;
