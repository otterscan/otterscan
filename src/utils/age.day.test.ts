import { describe, expect } from "@jest/globals";
import { ageString } from "./utils";

describe("day tests", () => {
  test("now", () => {
    expect(ageString(0)).toBe("now");
  });

  test("1 day", () => {
    expect(ageString(86400)).toBe("1 day ago");
  });

  test("2 days", () => {
    expect(ageString(172800)).toBe("2 days ago");
  });

  test("29 days", () => {
    expect(ageString(2505600)).toBe("29 days ago");
  });
});
