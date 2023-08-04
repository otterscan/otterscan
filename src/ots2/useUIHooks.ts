import { useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { RuntimeContext } from "../useRuntime";
import {
  BlockSummary,
  ContractMatch,
  ContractResultParser,
  ContractSearchType,
  useGenericContractSearch,
  useGenericContractsCount,
} from "./usePrototypeHooks";
import { PAGE_SIZE } from "../params";

/**
 * Extract the page number from query string; if it doesn't
 * exist or is not a number, assumes 1.
 */
export const usePageNumber = () => {
  let pageNumber = 1;

  const [searchParams] = useSearchParams();
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  return pageNumber;
};

const useContractSearch = <T extends ContractMatch>(
  t: ContractSearchType,
  p: ContractResultParser<T>
) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericContractsCount(provider, t);
  const results = useGenericContractSearch(
    provider,
    t,
    pageNumber,
    PAGE_SIZE,
    total,
    p
  );

  return {
    pageNumber,
    results,
    total,
  };
};

export type ResultMapper<T> = (
  m: any,
  blocksSummary: ReadonlyMap<number, BlockSummary>
) => T;

/**
 * Basic building block for a generic contract search browsing page.
 */
export const useContractSearchPage = <
  T extends ContractMatch,
  U extends unknown
>(
  t: ContractSearchType,
  p: ContractResultParser<T>,
  mapper: ResultMapper<U>
) => {
  const { pageNumber, results, total } = useContractSearch(t, p);

  const page: U[] | undefined = useMemo(() => {
    if (results === undefined) {
      return undefined;
    }

    const mapperWrapper = (m: any) => mapper(m, results.blocksSummary);
    return results.results.map(mapperWrapper).reverse();
  }, [results]);

  return {
    pageNumber,
    page,
    total,
  };
};
