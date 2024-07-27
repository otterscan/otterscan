import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const WhatsabiWarning: React.FC = () => (
  <div
    className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 px-3 py-2.5 mb-4 rounded mt-2"
    role="alert"
  >
    <FontAwesomeIcon icon={faWarning} className="mr-2" />
    <span className="text-md">
      Contract not found in Sourcify respository. Below is an estimate of the
      ABI from its bytecode.
    </span>
  </div>
);

export default WhatsabiWarning;
