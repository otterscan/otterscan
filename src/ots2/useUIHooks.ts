import { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { RuntimeContext } from "../useRuntime";
import {
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

export const useContractSearch = <T extends ContractMatch>(
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
