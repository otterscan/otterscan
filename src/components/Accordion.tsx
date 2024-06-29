import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useState } from "react";

interface AccordionProps {
  children: ReactNode;
  initialVisible?: boolean;
  title?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  children,
  initialVisible = false,
  title,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <span>
      <button
        className="ml-2 mt-2 rounded border bg-skin-button-fill px-1 py-0.5 text-sm text-skin-button hover:bg-skin-button-hover-fill"
        onClick={handleToggle}
        title={title}
      >
        <FontAwesomeIcon
          icon={isVisible ? faChevronUp : faChevronDown}
          size="sm"
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isVisible ? "max-h-80 pb-1" : "max-h-0"
        }`}
        {
          ...{
            inert: isVisible ? undefined : "",
          } /* Workaround until we upgrade to React 19 */
        }
      >
        {children}
      </div>
    </span>
  );
};

export default Accordion;
