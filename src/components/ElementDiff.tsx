import React from "react";

type ElementDiffProps = {
  oldElem: React.ReactNode | null;
  newElem: React.ReactNode | null;
  diffElem: React.ReactNode | null;
};

const ElementDiff: React.FC<ElementDiffProps> = ({
  oldElem,
  newElem,
  diffElem,
}) => (
  <div className="flex flex-row overflow-hidden items-center gap-3">
    <div className="flex flex-col rounded overflow-hidden">
      {oldElem !== null && (
        <div className="bg-opacity-10 dark:bg-opacity-30 bg-red-500 px-2 py-1">
          <div className="flex items-start">
            <span className="text-gray-500 mr-4 font-data select-none">-</span>
            {oldElem}
          </div>
        </div>
      )}
      {newElem !== null && (
        <div className="bg-opacity-20 dark:bg-green-300 bg-green-300 px-2 py-1">
          <div className="flex items-start">
            <span className="text-gray-500 mr-4 font-data select-none">+</span>
            {newElem}
          </div>
        </div>
      )}
    </div>
    {diffElem && <div>{diffElem}</div>}
  </div>
);

export default ElementDiff;
