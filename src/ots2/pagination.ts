export type ResultPage = {
  idx: number;
  count: number;
};

/**
 * Calculates the N-th page (1-based) backwards from the total of matches.
 *
 * i.e.: page 1 == [total - pageSize + 1, total]
 */
export const pageToReverseIdx = (
  pageNumber: number,
  pageSize: number,
  totalElements: number | undefined
): ResultPage | undefined => {
  if (totalElements === undefined) {
    return undefined;
  }

  let idx = totalElements - pageSize * pageNumber;
  let count = pageSize;

  // Last page? [1, total % pageSize]
  if (idx < 0) {
    count = idx + pageSize;
    if (count < 0) {
      count = 0;
    }
    idx = 0;
  }

  return { idx, count };
};
