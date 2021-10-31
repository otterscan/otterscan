import { BaseProvider } from "@ethersproject/providers";

export interface IAddressResolver<T> {
  resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<T | undefined>;
}
