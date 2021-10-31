import { BaseProvider } from "@ethersproject/providers";
import { ensRenderer } from "../../components/ENSName";
import { IAddressResolver, ResolvedAddressRenderer } from "./address-resolver";
import {
  CompositeAddressResolver,
  SelectedResolvedName,
} from "./CompositeAddressResolver";
import { ENSAddressResolver } from "./ENSAddressResolver";

export type ResolvedAddresses = Record<string, SelectedResolvedName<string>>;

// Create and configure the main resolver
export const ensResolver = new ENSAddressResolver();

const _mainResolver = new CompositeAddressResolver<string>();
_mainResolver.addResolver(ensResolver);

export const mainResolver: IAddressResolver<SelectedResolvedName<string>> =
  _mainResolver;

export const resolverRendererRegistry = new Map<
  IAddressResolver<string>,
  ResolvedAddressRenderer
>();
resolverRendererRegistry.set(ensResolver, ensRenderer);

export const batchPopulate = async (
  provider: BaseProvider,
  addresses: string[]
): Promise<ResolvedAddresses> => {
  const solvers: Promise<SelectedResolvedName<string> | undefined>[] = [];
  for (const a of addresses) {
    solvers.push(mainResolver.resolveAddress(provider, a));
  }

  const results = await Promise.all(solvers);
  const resultMap: ResolvedAddresses = {};
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r === undefined) {
      continue;
    }
    resultMap[addresses[i]] = r;
  }

  return resultMap;
};
