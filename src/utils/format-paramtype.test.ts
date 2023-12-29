import { describe, expect } from "@jest/globals";
import { Interface } from "ethers";
import { formatFragmentShort } from "./format-paramtype";

const testInt = new Interface([
  "function gt(uint256 value, bytes calldata data) public view returns(bool)",
  "function noArgs()",
  "function getFixedLengthStringArray(string[2][2] val) pure returns (string[2][2])",
  "function getTinyTuple((uint8 tinyUint8, bytes1 tinyBytes1, address tinyAddress) val) pure returns ((uint8 tinyUint8, bytes1 tinyBytes1, address tinyAddress))",
]);

function shortName(functionName: string): string {
  const func = testInt.getFunction(functionName);
  if (func === null) {
    throw new Error("Function not found in the interface");
  }
  return formatFragmentShort(func);
}

describe("ParamType formatting", () => {
  test("Basic function", () => {
    expect(shortName("gt")).toBe("gt(uint256 value, bytes data)");
  });

  test("No arguments", () => {
    expect(shortName("noArgs")).toBe("noArgs()");
  });

  test("Arrays", () => {
    expect(shortName("getFixedLengthStringArray")).toBe(
      "getFixedLengthStringArray(string[2][2] val)",
    );
  });

  test("Tuples", () => {
    expect(shortName("getTinyTuple")).toBe("getTinyTuple(tuple val)");
  });
});
