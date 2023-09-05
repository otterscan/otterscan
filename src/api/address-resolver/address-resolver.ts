import React from "react";
import { AbstractProvider } from "ethers";

export interface IAddressResolver<T> {
  resolveAddress(
    provider: AbstractProvider,
    address: string
  ): Promise<T | undefined>;
}

export type ResolvedAddressRenderer<T> = (
  chainId: bigint,
  address: string,
  resolvedAddress: T,
  linkable: boolean,
  dontOverrideColors: boolean
) => React.ReactElement;
