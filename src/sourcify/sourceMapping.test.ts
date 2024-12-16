import { describe, expect } from "@jest/globals";
import { bytecodeToInstructionIndex, getSourceRange } from "./sourceMapping";

function equalSourceMappings(sm1: string, sm2: string): void {
  const instrCount = sm1.split(";").length;
  for (let i = 0; i < instrCount; i++) {
    const inst1 = getSourceRange(sm1, i);
    const inst2 = getSourceRange(sm2, i);
    expect(inst1).toEqual(inst2);
  }
}

describe("source mapping parsing", () => {
  test("equivalent source maps", () => {
    const sm1 = "1:2:1;1:9:1;2:1:2;2:1:2;2:1:2";
    const sm2 = "1:2:1;:9;2:1:2;;";
    equalSourceMappings(sm1, sm2);
  });
});

describe("bytecode to instruction index mapping", () => {
  test("simple mapping", () => {
    const bytecode =
      "6080604052348015600e575f5ffd5b50600880601a5f395ff3fe60806040525f5ffd";
    const expectedInstructionMap = [
      0, 0, 1, 1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 15, 15, 16,
      17, 18, 19, 20, 21, 21, 22, 22, 23, 24, 25, 26,
    ];
    expect(bytecodeToInstructionIndex(bytecode)).toEqual(
      expectedInstructionMap,
    );
  });
});
