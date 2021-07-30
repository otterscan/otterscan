import React from "react";

type TimestampAgeProps = {
  now?: number | undefined;
  timestamp: number;
};

const TimestampAge: React.FC<TimestampAgeProps> = ({ now, timestamp }) => {
  if (now === undefined) {
    now = Date.now() / 1000;
  }
  let diff = now - timestamp;

  let desc = "";
  if (diff <= 1) {
    desc = "1 sec ago";
  } else if (diff < 60) {
    desc = `${Math.trunc(diff)} secs ago`;
  } else {
    const days = Math.trunc(diff / 86400);
    diff %= 86400;
    const hours = Math.trunc(diff / 3600);
    diff %= 3600;
    const mins = Math.trunc(diff / 60);

    desc = "";
    if (days > 0) {
      desc += `${days} ${days === 1 ? "day" : "days"} `;
    }
    if (hours > 0) {
      desc += `${hours} ${hours === 1 ? "hr" : "hrs"} `;
    }
    if (days === 0 && mins > 0) {
      desc += `${mins} ${mins === 1 ? "min" : "mins"} `;
    }
    desc += "ago";
  }

  return (
    <span className="truncate" title={desc}>
      {desc}
    </span>
  );
};

export default React.memo(TimestampAge);
