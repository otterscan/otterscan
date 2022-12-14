export const ageString = (diff: number) => {
  if (diff === 0) {
    return "now";
  }

  let desc = "";

  const isInThePast = diff > 0;
  if (!isInThePast) {
    desc = "in ";
    diff = -diff;
  }

  if (diff <= 1) {
    desc += "1 sec ";
  } else if (diff < 60) {
    desc += `${Math.trunc(diff)} secs `;
  } else {
    const days = Math.trunc(diff / 86400);
    diff %= 86400;
    const hours = Math.trunc(diff / 3600);
    diff %= 3600;
    const mins = Math.trunc(diff / 60);

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
