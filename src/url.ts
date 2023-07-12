import { BlockTag } from "@ethersproject/abstract-provider";
import { ChecksummedAddress } from "./types";

export const fourBytesURL = (
  assetsURLPrefix: string,
  fourBytes: string
): string => `${assetsURLPrefix}/signatures/${fourBytes}`;

export const topic0URL = (assetsURLPrefix: string, topic0: string): string =>
  `${assetsURLPrefix}/topic0/${topic0}`;

export const chainInfoURL = (
  assetsURLPrefix: string,
  chainId: number
): string => `${assetsURLPrefix}/chains/eip155-${chainId}.json`;

export const tokenLogoURL = (
  assetsURLPrefix: string,
  chainId: number,
  address: string
): string => `${assetsURLPrefix}/tokens/${chainId}/${address}/logo.png`;


export const epochURL = (epochNumber: number) => `/epoch/${epochNumber}`;

export const slotURL = (slotNumber: number) => `/slot/${slotNumber}`;

export const slotAttestationsURL = (slotNumber: number) =>
  `/slot/${slotNumber}/attestations`;

export const validatorURL = (validatorIndex: number) =>
  `/validator/${validatorIndex}`;

export const blockURL = (blockNum: BlockTag) => `/block/${blockNum}`;

export const blockTxsURL = (blockNum: BlockTag) => `/block/${blockNum}/txs`;

export const transactionURL = (txHash: string) => `/tx/${txHash}`;

export const addressByNonceURL = (address: ChecksummedAddress, nonce: number) =>
  `/address/${address}?nonce=${nonce}`;

export const openInRemixURL = (checksummedAddress: string, networkId: number) =>
  `https://remix.ethereum.org/#activate=sourcify&call=sourcify//fetchAndSave//${checksummedAddress}//${networkId}`;
