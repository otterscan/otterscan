import { useSearchParams } from "react-router-dom";

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
