import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useState } from "react";

interface AccordionProps {
  children: ReactNode;
  neighbor?: ReactNode;
  title?: string;
}

const Accordion: React.FC<AccordionProps> = ({ children, title, neighbor }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <span>
      <button
        className="ml-2 mt-2 rounded-sm border bg-skin-button-fill px-1.5 py-0.5 text-sm text-skin-button hover:bg-skin-button-hover-fill"
        type="button"
        onClick={handleToggle}
        title={title}
      >
        <FontAwesomeIcon icon={isVisible ? faMinus : faPlus} size="sm" />
      </button>
      {neighbor}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isVisible ? "max-h-80 pb-1" : "max-h-0"
        }`}
        inert={!isVisible}
      >
        {children}
      </div>
    </span>
  );
};

export default Accordion;
