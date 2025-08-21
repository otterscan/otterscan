import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  text: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="invisible group-hover:visible opacity-0 transition-all duration-100 ease-in-out group-hover:opacity-100 absolute left-1/2 transform -translate-x-1/2 bottom-full w-74 flex items-center justify-center overflow-visible">
        {/* CSS border triangle */}
        <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-800 absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
        <div className="mb-2 block bg-gray-800 text-white text-xs rounded-lg py-1.5 px-2 z-10 w-fit text-center">
          {text}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
