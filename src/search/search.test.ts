import { afterAll, describe, expect, jest, test } from "@jest/globals";
import { parseSearch } from "./search";

jest.mock("use-keyboard-shortcut", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const NativeURL = globalThis.URL;
const urlSpy = jest.spyOn(globalThis, "URL").mockImplementation((url, base) => {
  try {
    return new NativeURL(url, base);
  } catch {
    throw new TypeError("Invalid URL");
  }
});

afterAll(() => urlSpy.mockRestore());

describe("parseSearch", () => {
  test("recognizes only all-decimal input as a block number", () => {
    expect(parseSearch("123")).toBe("/block/123");
    expect(parseSearch("00123")).toBe("/block/123");
    expect(parseSearch("123alice.gwei")).toBe("/address/123alice.gwei");
  });

  test("routes numeric .gwei names to address resolution", () => {
    expect(parseSearch("1.gwei")).toBe("/address/1.gwei");
    expect(parseSearch("123.gwei")).toBe("/address/123.gwei");
  });

  test("preserves address nonce searches", () => {
    expect(parseSearch("0xbBBCe157ecBB945b1F92Af88413b911910C727c8:5")).toBe(
      "/address/0xbBBCe157ecBB945b1F92Af88413b911910C727c8?nonce=5",
    );
    expect(parseSearch("123.gwei:5")).toBe("/address/123.gwei?nonce=5");
  });

  test("does not truncate names containing a non-nonce colon", () => {
    expect(parseSearch("foo:bar.gwei")).toBe("/address/foo:bar.gwei");
    expect(parseSearch("foo:123.gwei")).toBe("/address/foo:123.gwei");
  });
});
