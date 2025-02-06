import { expect, test } from "@jest/globals";
import { trimToPrecision } from "./formatter";

describe("trimToPrecision", () => {
  test("tiny gas price", () => {
    expect(trimToPrecision(7n, 9, 3, 3)).toBe(7n);
  });

  test("small gas price (significant figures get priority)", () => {
    expect(trimToPrecision(4512n, 9, 3, 3)).toBe(4510n);
  });

  test("high gas price (decimal places get priority)", () => {
    expect(trimToPrecision(4289524854385n, 9, 3, 3)).toBe(4289524000000n);
  });
});
