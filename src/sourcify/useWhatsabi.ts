import { whatsabi } from "@shazow/whatsabi";
import { Interface, JsonRpcApiProvider } from "ethers";
import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { queryClient } from "../queryClient";
import { ChecksummedAddress } from "../types";
import { fourBytesURL } from "../url";
import { getCodeQuery } from "../useErigonHooks";
import { Match, MatchType } from "./useSourcify";

export const useWhatsabiMetadata = (
  address: ChecksummedAddress | undefined,
  chainId: bigint | undefined,
  provider: JsonRpcApiProvider,
  assetsURLPrefix: string | undefined,
): Match | null | undefined => {
  const fetcher = whatsabiFetcher(provider, assetsURLPrefix);
  const key = ["whatsabi", address, chainId];
  const { data, error } = useSWRImmutable<Match | null | undefined>(
    address !== undefined ? key : null,
    fetcher,
  );
  if (error) {
    return null;
  }
  return data;
};

function whatsabiFetcher(
  provider: JsonRpcApiProvider,
  assetsURLPrefix: string | null | undefined,
): Fetcher<Match | null | undefined, ["whatsabi", ChecksummedAddress, bigint]> {
  return async ([_, address, chainId]) => {
    const code = await queryClient.fetchQuery(
      getCodeQuery(provider, address, "latest"),
    );
    const selectors = whatsabi.selectorsFromBytecode(code);
    const decodedFunctions: (string | null)[] = await Promise.all(
      selectors.map(async (selector) => {
        if (assetsURLPrefix === null || assetsURLPrefix === undefined) {
          return null;
        }
        try {
          const result = await fetch(
            fourBytesURL(assetsURLPrefix, selector.slice(2)),
          );
          if (!result.ok) {
            throw new Error(`4bytes fetch returned ${result.status} response`);
          }
          const text = await result.text();
          const sig = text.split(";")[0];
          if (sig.length > 0) {
            return `function ${sig} external view`;
          }
        } catch (e) {}
        return null;
      }),
    );
    const unknownSelectors = selectors.filter(
      (selector, i) => decodedFunctions[i] === null,
    );
    const functions: string[] = decodedFunctions
      .filter((sig) => sig !== null)
      .sort() as string[];
    const int = Interface.from([...functions]);
    const abi = JSON.parse(int.formatJson());
    const metadata = {
      version: "Unknown",
      language: "Unknown",
      compiler: { version: "Unknown" },
      sources: {},
      // settings: {remappings: [], compilationTarget: {}, libraries: {}},
      output: {
        abi,
      },
    };

    return {
      type: MatchType.WHATSABI_GUESS,
      metadata: metadata,
      unknownSelectors,
    };
  };
}
