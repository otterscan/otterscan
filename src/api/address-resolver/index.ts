import { ensRenderer } from "../../components/ENSName";
import { plainStringRenderer } from "../../components/PlainString";
import { tokenRenderer } from "../../components/TokenName";
import { uniswapV1PairRenderer } from "../../components/UniswapV1ExchangeName";
import { uniswapV2PairRenderer } from "../../components/UniswapV2PairName";
import { uniswapV3PairRenderer } from "../../components/UniswapV3PoolName";
import { IAddressResolver, ResolvedAddressRenderer } from "./address-resolver";
import {
  CompositeAddressResolver,
  SelectedResolvedName,
} from "./CompositeAddressResolver";
import { ENSAddressResolver } from "./ENSAddressResolver";
import { UniswapV1Resolver } from "./UniswapV1Resolver";
import { UniswapV2Resolver } from "./UniswapV2Resolver";
import { UniswapV3Resolver } from "./UniswapV3Resolver";
import { ERCTokenResolver } from "./ERCTokenResolver";
import { HardcodedAddressResolver } from "./HardcodedAddressResolver";

export type ResolvedAddresses = Record<string, SelectedResolvedName<any>>;

// Create and configure the main resolver
export const ensResolver = new ENSAddressResolver();
export const uniswapV1Resolver = new UniswapV1Resolver();
export const uniswapV2Resolver = new UniswapV2Resolver();
export const uniswapV3Resolver = new UniswapV3Resolver();
export const ercTokenResolver = new ERCTokenResolver();
export const hardcodedResolver = new HardcodedAddressResolver();

const _mainResolver = new CompositeAddressResolver();
_mainResolver.addResolver(ensResolver);
_mainResolver.addResolver(uniswapV3Resolver);
_mainResolver.addResolver(uniswapV2Resolver);
_mainResolver.addResolver(uniswapV1Resolver);
_mainResolver.addResolver(ercTokenResolver);
_mainResolver.addResolver(hardcodedResolver);

export const mainResolver: IAddressResolver<SelectedResolvedName<any>> =
  _mainResolver;

export const resolverRendererRegistry = new Map<
  IAddressResolver<any>,
  ResolvedAddressRenderer<any>
>();
resolverRendererRegistry.set(ensResolver, ensRenderer);
resolverRendererRegistry.set(uniswapV1Resolver, uniswapV1PairRenderer);
resolverRendererRegistry.set(uniswapV2Resolver, uniswapV2PairRenderer);
resolverRendererRegistry.set(uniswapV3Resolver, uniswapV3PairRenderer);
resolverRendererRegistry.set(ercTokenResolver, tokenRenderer);
resolverRendererRegistry.set(hardcodedResolver, plainStringRenderer);
