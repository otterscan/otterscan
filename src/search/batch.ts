export function trimBatchesToSize<T, B extends { length: number }>(
  list: T[],
  batches: B[],
  targetSize: number,
  trimFromStart: boolean,
  requiredIndex?: number,
): { list: T[]; batches: B[] } {
  let sizeAccumulator = 0;
  let batchIndex = trimFromStart ? 0 : batches.length - 1;
  // Direction of iteration
  let step = trimFromStart ? 1 : -1;

  // Find how many batches are needed to reach the target size
  let batchesToKeep = 0;
  let requiredIndexFound = requiredIndex === undefined;
  while (batchIndex >= 0 && batchIndex < batches.length) {
    if (
      requiredIndex === undefined ||
      (trimFromStart
        ? requiredIndex >= sizeAccumulator &&
          requiredIndex < sizeAccumulator + batches[batchIndex].length
        : requiredIndex >=
            list.length - sizeAccumulator - batches[batchIndex].length &&
          requiredIndex < list.length - sizeAccumulator)
    ) {
      requiredIndexFound = true;
    }
    sizeAccumulator += batches[batchIndex].length;
    batchesToKeep += 1;
    if (sizeAccumulator >= targetSize && requiredIndexFound) {
      break;
    }
    batchIndex += step;
  }

  // Splice lists and return
  const listStart = trimFromStart ? 0 : list.length - sizeAccumulator;
  const updatedList = list.slice(
    listStart,
    trimFromStart ? sizeAccumulator : list.length,
  );
  return {
    list: updatedList,
    batches: batches.slice(
      trimFromStart ? 0 : batches.length - batchesToKeep,
      trimFromStart ? batchesToKeep : batches.length,
    ),
  };
}
