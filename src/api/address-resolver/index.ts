import { BaseProvider } from "@ethersproject/providers";
import { ensRenderer } from "../../components/ENSName";
import { tokenRenderer } from "../../components/TokenName";
import { IAddressResolver, ResolvedAddressRenderer } from "./address-resolver";
import {
  CompositeAddressResolver,
  SelectedResolvedName,
} from "./CompositeAddressResolver";
import { ENSAddressResolver } from "./ENSAddressResolver";
import { ERCTokenResolver } from "./ERCTokenResolver";

export type ResolvedAddresses = Record<string, SelectedResolvedName<any>>;

// Create and configure the main resolver
export const ensResolver = new ENSAddressResolver();
export const ercTokenResolver = new ERCTokenResolver();

const _mainResolver = new CompositeAddressResolver();
_mainResolver.addResolver(ensResolver);
_mainResolver.addResolver(ercTokenResolver);

export const mainResolver: IAddressResolver<SelectedResolvedName<any>> =
  _mainResolver;

export const resolverRendererRegistry = new Map<
  IAddressResolver<any>,
  ResolvedAddressRenderer<any>
>();
resolverRendererRegistry.set(ensResolver, ensRenderer);
resolverRendererRegistry.set(ercTokenResolver, tokenRenderer);

export const batchPopulate = async (
  provider: BaseProvider,
  addresses: string[]
): Promise<ResolvedAddresses> => {
  const solvers: Promise<SelectedResolvedName<any> | undefined>[] = [];
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
