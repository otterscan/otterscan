import { describe, expect } from "@jest/globals";
import { parse } from "./contractInputDataParser";

describe("contract input data parser", () => {
  test("booleans", () => {
    expect(parse("true").ast?.values?.value).toEqual([true]);
    expect(parse("false,true").ast?.values?.value).toEqual([false, true]);
  });
  test("number types", () => {
    expect(parse("0").ast?.values?.value).toEqual([0n]);
    expect(
      parse("42978156640340513088189666230157").ast?.values?.value
    ).toEqual([42978156640340513088189666230157n]);
    expect(parse("-343, -35").ast?.values?.value).toEqual([-343n, -35n]);
    expect(parse("-5234008651920315").ast?.values?.value).toEqual([
      -5234008651920315n,
    ]);
  });
  test("fixed decimal numbers", () => {
    expect(parse("3e18").ast?.values?.value).toEqual([3000000000000000000n]);
    expect(parse("0.3e1").ast?.values?.value).toEqual([3n]);
    expect(
      parse("0.012345678901234567899876543210e32").ast?.values?.value
    ).toEqual([1234567890123456789987654321000n]);
    expect(parse("-1e0").ast?.values?.value).toEqual([-1n]);
    expect(parse("-0.1e1").ast?.values?.value).toEqual([-1n]);
  });
  test("address types", () => {
    expect(
      parse("0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326").ast?.values?.value
    ).toEqual(["0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326"]);
  });
  test("hex types", () => {
    expect(parse("0x1ea372").ast?.values?.value).toEqual(["0x1ea372"]);
  });
  test("strings", () => {
    expect(parse('"USDC"').ast?.values?.value).toEqual(["USDC"]);
    expect(parse('"Quote \\"this\\""').ast?.values?.value).toEqual([
      'Quote "this"',
    ]);
    expect(parse('"USDC"').ast?.values?.value).toEqual(["USDC"]);
    expect(parse('"newline\\nhere"').ast?.values?.value).toEqual([
      "newline\nhere",
    ]);
  });
  test("multiple arguments", () => {
    expect(parse('0x34, -1e3, "mars"').ast?.values?.value).toEqual([
      "0x34",
      -1000n,
      "mars",
    ]);
  });
  test("arrays", () => {
    expect(parse("[1, 2, 3]").ast?.values?.value).toEqual([[1n, 2n, 3n]]);
  });
  test("several nested arrays", () => {
    expect(
      parse(
        '[["USDC", 0.99e6], ["DAI", 1.011e18], ["USDT", 0.9947e6]],[1, 2, 3e0]'
      ).ast?.values?.value
    ).toEqual([
      [
        ["USDC", 990000n],
        ["DAI", 1011000000000000000n],
        ["USDT", 994700n],
      ],
      [1n, 2n, 3n],
    ]);
  });
  test("empty arrays", () => {
    expect(parse("[]").ast?.values?.value).toEqual([[]]);
    expect(parse("[[],[[],[]], [[[]]]]").ast?.values?.value).toEqual([
      [[], [[], []], [[[]]]],
    ]);
  });
});
