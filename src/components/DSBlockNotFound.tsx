import React from "react";
import ContentFrame from "./ContentFrame";

type DSBlockNotFoundProps = {
  blockNumberOrHash: string;
};

const DSBlockNotFound: React.FC<DSBlockNotFoundProps> = ({ blockNumberOrHash }) => (
  <ContentFrame>
    <div className="py-4 text-sm">DS Block "{blockNumberOrHash}" not found.</div>
  </ContentFrame>
);

export default React.memo(DSBlockNotFound);
