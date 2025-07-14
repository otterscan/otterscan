import { describe, expect, test } from "@jest/globals";
import { trimBatchesToSize } from "./batch";

const myList = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];
const batches = [{ length: 8 }, { length: 4 }, { length: 3 }, { length: 5 }];

describe("trimBatchesToSize", () => {
  describe("Trimming from start", () => {
    test("Trim to 9", () => {
      const result = trimBatchesToSize(myList, batches, 9, true);
      expect(result.list).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      expect(result.batches).toEqual([{ length: 8 }, { length: 4 }]);
    });

    test("Trim to 8 (exact batch match)", () => {
      const result = trimBatchesToSize(myList, batches, 8, true);
      expect(result.list).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(result.batches).toEqual([{ length: 8 }]);
    });
  });

  describe("Trimming from end", () => {
    test("Trim to 9", () => {
      const result = trimBatchesToSize(myList, batches, 9, false);
      expect(result.list).toEqual([
        9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
      expect(result.batches).toEqual([
        { length: 4 },
        { length: 3 },
        { length: 5 },
      ]);
    });

    test("Trim to 8", () => {
      const result = trimBatchesToSize(myList, batches, 8, false);
      expect(result.list).toEqual([13, 14, 15, 16, 17, 18, 19, 20]);
      expect(result.batches).toEqual([{ length: 3 }, { length: 5 }]);
    });
  });
});
