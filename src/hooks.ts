import { JsonRpcProvider } from "@ethersproject/providers";
import { ChecksummedAddress } from "./types";
import {
  Metadata,
  useDedupedAddresses,
  useMultipleMetadata,
} from "./sourcify/useSourcify";
import { useAppConfigContext } from "./useAppConfig";
import { useAddressesWithCode } from "./useErigonHooks";

export const useContractsMetadata = (
  addresses: ChecksummedAddress[],
  provider: JsonRpcProvider | undefined,
  baseMetadatas?: Record<string, Metadata | null>
) => {
  const deduped = useDedupedAddresses(addresses);
  const contracts = useAddressesWithCode(provider, deduped);
  const { sourcifySource } = useAppConfigContext();
  const metadatas = useMultipleMetadata(
    baseMetadatas,
    contracts,
    provider?.network.chainId,
    sourcifySource
  );

  return metadatas;
};
