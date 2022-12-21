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
