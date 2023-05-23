import { describe, expect } from "@jest/globals";
import { pageToReverseIdx } from "./pagination";

describe("pagination tests", () => {
  test("first page", () => {
    expect(pageToReverseIdx(1, 25, 99)).toEqual({ idx: 74, count: 25 });
  });

  test("last page", () => {
    expect(pageToReverseIdx(4, 25, 99)).toEqual({ idx: 0, count: 24 });
  });

  test("inexistent page", () => {
    expect(pageToReverseIdx(5, 25, 99)).toEqual({ idx: 0, count: 0 });
  });
});
