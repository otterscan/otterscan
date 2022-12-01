import { describe, expect } from "@jest/globals";
import { ageString } from "./utils";

describe("second tests", () => {
  test("1 second", () => {
    expect(ageString(1)).toBe("1 sec ago");
  });

  test("2 seconds", () => {
    expect(ageString(2)).toBe("2 secs ago");
  });

  test("59 seconds", () => {
    expect(ageString(59)).toBe("59 secs ago");
  });
});

describe("minute tests", () => {
  test("1 minute", () => {
    expect(ageString(60)).toBe("1 min ago");
  });

  test("2 minutes", () => {
    expect(ageString(120)).toBe("2 mins ago");
  });

  test("almost 2 minutes", () => {
    expect(ageString(119)).toBe("1 min ago");
  });

  test("just after 2 minutes", () => {
    expect(ageString(121)).toBe("2 mins ago");
  });

  test("59 minutes", () => {
    expect(ageString(3540)).toBe("59 mins ago");
  });
});

describe("hour tests", () => {
  test("1 hour", () => {
    expect(ageString(3600)).toBe("1 hr ago");
  });

  test("2 hours", () => {
    expect(ageString(7200)).toBe("2 hrs ago");
  });

  test("almost 2 hours", () => {
    expect(ageString(7199)).toBe("1 hr 59 mins ago");
  });

  test("just after 2 hours", () => {
    expect(ageString(7201)).toBe("2 hrs ago");
  });

  test("23 hours", () => {
    expect(ageString(82800)).toBe("23 hrs ago");
  });
});
