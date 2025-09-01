import { faCheckCircle, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import SourcifyIcon from "./sourcify.svg";

interface SourcifyLogoProps {
  locallyVerified?: boolean;
}

const SourcifyLogo: React.FC<SourcifyLogoProps> = ({ locallyVerified }) => {
  const title = locallyVerified ? "Locally verified" : "Verified by Sourcify";
  return (
    <div className="relative inline-block">
      <img
        src={SourcifyIcon}
        alt="Sourcify logo"
        title={title}
        width={16}
        height={16}
      />
      {locallyVerified && (
        <div title={title}>
          {/* Draws a white circle behind to ensure the checkmark is white */}
          <FontAwesomeIcon
            className="absolute bottom-0 right-[-2px] ml-1 text-white dark:text-black text-[5.6pt]"
            icon={faCircle}
          />
          <FontAwesomeIcon
            className="absolute bottom-0 right-[-2px] text-emerald-500 text-[6pt]"
            icon={faCheckCircle}
          />
        </div>
      )}
    </div>
  );
};

export default SourcifyLogo;
