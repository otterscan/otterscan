import { describe, expect } from "@jest/globals";
import { hexToArray } from "./utils";

describe("hexToArray tests", () => {
  test("empty string", () => {
    expect(hexToArray("")).toEqual(new Uint8Array([]));
  });

  test("single byte (no 0x prefix)", () => {
    expect(hexToArray("FF")).toEqual(new Uint8Array([255]));
  });

  test("single byte (with 0x prefix)", () => {
    expect(hexToArray("0xFF")).toEqual(new Uint8Array([255]));
  });

  test("odd-length hex string", () => {
    expect(hexToArray("F")).toEqual(new Uint8Array([15]));
  });

  test("multiple bytes", () => {
    expect(hexToArray("FFEEDDCC")).toEqual(
      new Uint8Array([255, 238, 221, 204]),
    );
  });

  test("mixed case", () => {
    expect(hexToArray("0xfFEeDdcc")).toEqual(
      new Uint8Array([255, 238, 221, 204]),
    );
  });
});
