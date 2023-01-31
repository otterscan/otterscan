import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCopy } from "@fortawesome/free-regular-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

type CopyProps = {
  value: string;
  rounded?: boolean;
};

const Copy: React.FC<CopyProps> = ({ value, rounded }) => {
  const [copying, setCopying] = useState<boolean>(false);
  const doCopy = () => {
    navigator.clipboard.writeText(value);
    setCopying(true);

    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return (
    <button
      className={`flex-no-wrap flex items-center justify-center space-x-1 self-center text-gray-500 focus:outline-none ${
        rounded
          ? "transition-shadows h-7 w-7 rounded-full bg-gray-200 text-xs transition-colors hover:bg-gray-500 hover:text-gray-200 hover:shadow"
          : "text-sm"
      }`}
      title="Click to copy to clipboard"
      onClick={doCopy}
    >
      {copying ? (
        rounded ? (
          <FontAwesomeIcon icon={faCheck} size="1x" />
        ) : (
          <>
            <FontAwesomeIcon icon={faCheckCircle} size="1x" />
            <span className="self-baseline">Copied</span>
          </>
        )
      ) : (
        <FontAwesomeIcon icon={faCopy} size="1x" />
      )}
    </button>
  );
};

export default React.memo(Copy);
