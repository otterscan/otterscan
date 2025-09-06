import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface AlertProps {
  className?: string;
  margin?: string;
  icon?: IconDefinition;
  children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  className = "bg-orange-100 border-orange-500 text-orange-700",
  margin = "mb-4 mt-2",
  icon,
  children,
}) => (
  <div
    className={` ${className} ${margin} border-l-4 px-3 py-2.5 rounded-sm border-t-0 border-b-0`}
    role="alert"
  >
    {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
    <span className="text-md">{children}</span>
  </div>
);

export default Alert;
