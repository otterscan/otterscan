import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons/faCopy";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons/faCheckCircle";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";

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
      className={`text-gray-500 focus:outline-none ${
        rounded
          ? "transition-colors transition-shadows bg-gray-200 hover:bg-gray-500 hover:text-gray-200 hover:shadow w-7 h-7 rounded-full text-xs"
          : "text-sm"
      }`}
      title="Click to copy to clipboard"
      onClick={doCopy}
    >
      {copying ? (
        rounded ? (
          <FontAwesomeIcon icon={faCheck} size="1x" />
        ) : (
          <div className="space-x-1">
            <FontAwesomeIcon icon={faCheckCircle} size="1x" />
            {!rounded && <span>Copied</span>}
          </div>
        )
      ) : (
        <FontAwesomeIcon icon={faCopy} size="1x" />
      )}
    </button>
  );
};

export default React.memo(Copy);
