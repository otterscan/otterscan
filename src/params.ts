import { BigNumber } from "@ethersproject/bignumber";

export const MIN_API_LEVEL = 8;

export const PAGE_SIZE = 25;

// INFINITE === > 1 trillion
export const ALLOWANCE_MIN_INFINITE = BigNumber.from(
  "1000000000000000000000000000000"
);
