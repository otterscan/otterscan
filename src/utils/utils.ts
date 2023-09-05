export const ageString = (durationInSecs: number) => {
  if (durationInSecs === 0) {
    return "now";
  }

  let desc = "";

  const isInThePast = durationInSecs > 0;
  if (!isInThePast) {
    desc = "in ";
    durationInSecs = -durationInSecs;
  }

  if (durationInSecs <= 1) {
    desc += "1 sec ";
  } else if (durationInSecs < 60) {
    desc += `${Math.trunc(durationInSecs)} secs `;
  } else {
    const days = Math.trunc(durationInSecs / 86400);
    durationInSecs %= 86400;
    const hours = Math.trunc(durationInSecs / 3600);
    durationInSecs %= 3600;
    const mins = Math.trunc(durationInSecs / 60);

    if (days > 0) {
      desc += `${days} ${days === 1 ? "day" : "days"} `;
    }
    if (hours > 0) {
      desc += `${hours} ${hours === 1 ? "hr" : "hrs"} `;
    }
    if (days === 0 && mins > 0) {
      desc += `${mins} ${mins === 1 ? "min" : "mins"} `;
    }
  }
  if (isInThePast) {
    desc += "ago";
  } else {
    desc = desc.trimEnd();
  }

  return desc;
};

export function commify(value: string | number | bigint): string {
  const comps = String(value).split(".");

  if (
    comps.length > 2 ||
    !comps[0].match(/^-?[0-9]*$/) ||
    (comps[1] && !comps[1].match(/^[0-9]*$/)) ||
    value === "." ||
    value === "-."
  ) {
    throw new Error("invalid commify value: " + value);
  }

  // Make sure we have at least one whole digit (0 if none)
  let whole = comps[0];

  let negative = "";
  if (whole.substring(0, 1) === "-") {
    negative = "-";
    whole = whole.substring(1);
  }

  // Make sure we have at least 1 whole digit with no leading zeros
  while (whole.substring(0, 1) === "0") {
    whole = whole.substring(1);
  }
  if (whole === "") {
    whole = "0";
  }

  let suffix = "";
  if (comps.length === 2) {
    suffix = "." + (comps[1] || "0");
  }
  while (suffix.length > 2 && suffix[suffix.length - 1] === "0") {
    suffix = suffix.substring(0, suffix.length - 1);
  }

  const formatted = [];
  while (whole.length) {
    if (whole.length <= 3) {
      formatted.unshift(whole);
      break;
    } else {
      const index = whole.length - 3;
      formatted.unshift(whole.substring(index));
      whole = whole.substring(0, index);
    }
  }

  return negative + formatted.join(",") + suffix;
}
