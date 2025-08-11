import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Tooltip from "./Tooltip";

interface InfoButtonProps {
  children: React.ReactNode;
}

const InfoButton: React.FC<InfoButtonProps> = ({ children }) => (
  <div className="inline-flex items-center h-full">
    <Tooltip text={children}>
      <button className="flex items-center justify-center w-5 h-5 text-md text-black rounded-full focus:outline-none">
        <FontAwesomeIcon icon={faInfoCircle} size="1x" />
      </button>
    </Tooltip>
  </div>
);

export default InfoButton;
