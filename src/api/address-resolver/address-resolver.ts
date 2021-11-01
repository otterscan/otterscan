import React from "react";
import { BaseProvider } from "@ethersproject/providers";

export interface IAddressResolver<T> {
  resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<T | undefined>;
}

export type ResolvedAddressRenderer<T> = (
  address: string,
  resolvedAddress: T,
  linkable: boolean,
  dontOverrideColors: boolean
) => React.ReactElement;
