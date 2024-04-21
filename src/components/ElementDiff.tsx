import React from "react";

type ElementDiffProps = {
  oldElem: React.ReactNode | null;
  newElem: React.ReactNode | null;
};

const ElementDiff: React.FC<ElementDiffProps> = ({ oldElem, newElem }) => {
  return (
    <div className="flex flex-col rounded overflow-hidden">
      {oldElem !== null && (
        <div className="bg-opacity-10 bg-red-500 p-2">
          <div className="flex items-start">
            <span className="text-gray-500 mr-4 font-data select-none">-</span>
            {oldElem}
          </div>
        </div>
      )}
      {newElem !== null && (
        <div className="bg-opacity-20 bg-green-300 p-2">
          <div className="flex items-start">
            <span className="text-gray-500 mr-4 font-data select-none">+</span>
            {newElem}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementDiff;
