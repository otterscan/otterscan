import { describe, expect } from "@jest/globals";
import { ageString } from "./utils";

describe("second tests", () => {
  test("1 second", () => {
    expect(ageString(-1)).toBe("in 1 sec");
  });

  test("2 seconds", () => {
    expect(ageString(-2)).toBe("in 2 secs");
  });

  test("59 seconds", () => {
    expect(ageString(-59)).toBe("in 59 secs");
  });
});

describe("minute tests", () => {
  test("1 minute", () => {
    expect(ageString(-60)).toBe("in 1 min");
  });

  test("2 minutes", () => {
    expect(ageString(-120)).toBe("in 2 mins");
  });

  test("almost 2 minutes", () => {
    expect(ageString(-119)).toBe("in 1 min");
  });

  test("just after 2 minutes", () => {
    expect(ageString(-121)).toBe("in 2 mins");
  });

  test("59 minutes", () => {
    expect(ageString(-3540)).toBe("in 59 mins");
  });
});

describe("hour tests", () => {
  test("1 hour", () => {
    expect(ageString(-3600)).toBe("in 1 hr");
  });

  test("2 hours", () => {
    expect(ageString(-7200)).toBe("in 2 hrs");
  });

  test("almost 2 hours", () => {
    expect(ageString(-7199)).toBe("in 1 hr 59 mins");
  });

  test("just after 2 hours", () => {
    expect(ageString(-7201)).toBe("in 2 hrs");
  });

  test("23 hours", () => {
    expect(ageString(-82800)).toBe("in 23 hrs");
  });
});
