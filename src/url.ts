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

export enum SourcifySource {
  // Resolve trusted IPNS for root IPFS
  IPFS_IPNS,

  // Centralized Sourcify servers
  CENTRAL_SERVER,

  // Snapshot server
  CUSTOM_SNAPSHOT_SERVER,
}

const sourcifyIPNS =
  "k51qzi5uqu5dll0ocge71eudqnrgnogmbr37gsgl12uubsinphjoknl6bbi41p";
const ipfsGatewayPrefix = `https://ipfs.io/ipns/${sourcifyIPNS}`;
// const ipfsGatewayPrefix = "http://localhost:8080/ipfs/QmWQoGfrLcizHueg3YkgDCh1S7SkfSP9A7H8YeZmUDfbnn"
const sourcifyHttpRepoPrefix = `https://repo.sourcify.dev`;
const snapshotPrefix = "http://localhost:3006";

const resolveSourcifySource = (source: SourcifySource) => {
  if (source === SourcifySource.IPFS_IPNS) {
    return ipfsGatewayPrefix;
  }
  if (source === SourcifySource.CENTRAL_SERVER) {
    return sourcifyHttpRepoPrefix;
  }
  return snapshotPrefix;
};

export const sourcifyMetadata = (
  checksummedAddress: string,
  networkId: number,
  source: SourcifySource
) =>
  `${resolveSourcifySource(
    source
  )}/contracts/full_match/${networkId}/${checksummedAddress}/metadata.json`;

export const sourcifySourceFile = (
  checksummedAddress: string,
  networkId: number,
  filepath: string,
  source: SourcifySource
) =>
  `${resolveSourcifySource(
    source
  )}/contracts/full_match/${networkId}/${checksummedAddress}/sources/${filepath}`;

export const openInRemixURL = (checksummedAddress: string, networkId: number) =>
  `https://remix.ethereum.org/#call=source-verification//fetchAndSave//${checksummedAddress}//${networkId}`;
