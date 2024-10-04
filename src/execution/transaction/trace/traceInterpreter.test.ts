import { describe, expect } from "@jest/globals";
import {
  commonDeduplicatedBlocks,
  findLastUniqueLocation,
  findTraceExitLocations,
} from "./traceInterpreter";

const endsInRevertVmTrace = {
  code: "0x6080",
  ops: [
    {
      cost: 3,
      ex: {
        mem: null,
        push: ["100", "128"],
        store: null,
        used: 146086,
      },
      pc: 7685,
      sub: null,
      op: "SWAP1",
      idx: "101-162",
    },
    {
      cost: 0,
      ex: {
        mem: null,
        push: [],
        store: null,
        used: 146086,
      },
      pc: 7686,
      sub: null,
      op: "REVERT",
      idx: "101-163",
    },
  ],
};

describe("trace interpreter", () => {
  test("ends in revert", () => {
    const exitLocations = findTraceExitLocations(endsInRevertVmTrace);
    expect(exitLocations.endsInRevert).toEqual(true);
  });
});

describe("findLastUniqueLocation", () => {
  it("returns -1 for empty offsets array", () => {
    const code = new Uint8Array([]);
    const offsets: number[] = [];
    expect(findLastUniqueLocation(offsets, code)).toBe(-1);
  });

  it("returns last offset index when no common block is found", () => {
    const code = new Uint8Array([0x01, 0x02, 0x03]);
    const pc = [1, 2];
    expect(findLastUniqueLocation(pc, code)).toBe(1);
  });

  it("skips common deduplicated block at the end", () => {
    const code = new Uint8Array([
      // "Unique" code
      0x01,
      0x02,
      0x03,
      ...commonDeduplicatedBlocks[0], // Revert block
    ]);
    const pc = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11];
    expect(findLastUniqueLocation(pc, code)).toBe(2);
  });

  it("correctly handles common revert block", () => {
    const code = new Uint8Array([
      // Revert block
      ...commonDeduplicatedBlocks[0],
      // Offset: 9, 10, 11
      0x01,
      0x02,
      0x03,
      // Another revert block
      ...commonDeduplicatedBlocks[0],
    ]);
    const pc = [10, 11, 12, 13, 15, 16, 17, 18, 19, 20];
    expect(findLastUniqueLocation(pc, code)).toBe(1);
  });
});
