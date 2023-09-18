// TODO: Once devex is completely depricated we can alter the zilliqa APIs so
// values are returned in a format that is easier to handle in Otterscan such
// as Timestamp

import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import useSWRInfinite from "swr/infinite";
import { DsBlockObj, BlockchainInfo } from '@zilliqa-js/core/dist/types/src/types'
import { Zilliqa } from "@zilliqa-js/zilliqa";

const dsBlockDataFetcher: Fetcher<
    DsBlockObj | null,
  [Zilliqa, number]
> = async ([zilliqa, blockNum]) => {
  const response = await zilliqa.blockchain.getDSBlock(blockNum);
  if (response.error !== undefined) throw new Error(response.error.message);
  if (response.result.header.BlockNum !== blockNum.toString())
    throw new Error("Invalid DS Block Number");
  return response.result as DsBlockObj;
};

export const useDSBlockData = (
  zilliqa: Zilliqa | undefined,
  blockNumberOrHash: string | undefined
): { data: DsBlockObj | null | undefined; isLoading: boolean } => {
  const { data, error, isLoading } = useSWRImmutable(
    zilliqa !== undefined && blockNumberOrHash !== undefined
      ? [zilliqa, blockNumberOrHash]
      : null,
    dsBlockDataFetcher,
    { keepPreviousData: true }
  );
  if (error) {
    return { data: undefined, isLoading: false };
  }
  return { data, isLoading };
};

export const useDSBlocksData = (
  zilliqa : Zilliqa | undefined,
  blockNumber: number | undefined,
  pageNumber: number,
  pageSize: number
): { data: (DsBlockObj | null)[] | undefined; isLoading: boolean } => {
  const startBlockNum : number | undefined = blockNumber ? blockNumber - ( pageSize * pageNumber) : undefined;

  // This function is used by SWR to get the key which we pass to the fetcher function
  // It also searches the cache for the presence of this key and if found returns the 
  // cached value. The pageSize differenciates the cache between components so that different components
  // do not display incorrect number of displays
  const getKey = (pageIndex : number) 
  : [ Zilliqa, number, number] | null =>  {
    if((zilliqa == undefined || startBlockNum == undefined) 
    || (startBlockNum - pageIndex < 0)) return null;

    return [zilliqa, startBlockNum - pageIndex, pageSize]
  }

  // Calls the fetcher to fetch the most recent pageNumber of blocks in parallel
  const { data, error, isLoading, isValidating } = useSWRInfinite(getKey,
    dsBlockDataFetcher,
    { keepPreviousData: true, revalidateFirstPage : false, initialSize : pageSize, parallel : true }
  );
  if (error) {
    return { data: undefined, isLoading: false };
  }
  return { data, isLoading :  isLoading || isValidating};
};

export const blockchainInfoFetcher: Fetcher<BlockchainInfo,
  Zilliqa> = async (zilliqa : Zilliqa) => {
  const response = await zilliqa.blockchain.getBlockChainInfo();
  if (response.error !== undefined) throw new Error(response.error.message);
  return response.result as BlockchainInfo;
}


export const useBlockChainInfo = (
  zilliqa : Zilliqa | undefined
): { data: BlockchainInfo | undefined; isLoading: boolean } => {
  const { data, error, isLoading } = useSWRImmutable(
    zilliqa !== undefined
      ? zilliqa
      : null,
    blockchainInfoFetcher,
    { keepPreviousData: true }
  );
  if (error) {
    return { data: undefined, isLoading: false };
  }
  return { data, isLoading };
};

