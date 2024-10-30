// Solidity panic codes, sourced from https://docs.soliditylang.org/en/latest/control-structures.html
export const panicCodeMessages: { [key: string]: string } = {
  "0": "compiler-inserted panic (generic)",
  "1": "assertion failed (argument evaluated to false)",
  "17": "arithmetic underflow/overflow outside unchecked block",
  "18": "division or modulo by zero",
  "33": "enum type conversion: value too big or negative",
  "34": "incorrectly encoded storage byte array access",
  "49": "pop() called on an empty array",
  "50": "out-of-bounds or negative index access (arrays, bytesN, slices)",
  "65": "excessive memory allocation or excessively large array creation",
  "81": "call to zero-initialized internal function type variable",
};
