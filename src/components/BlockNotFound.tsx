import React from "react";
import ContentFrame from "../ContentFrame";

type BlockNotFoundProps = {
  blockNumberOrHash: string;
};

const BlockNotFound: React.FC<BlockNotFoundProps> = ({ blockNumberOrHash }) => (
  <>
    <ContentFrame>
      <div className="py-4 text-sm">Block "{blockNumberOrHash}" not found.</div>
    </ContentFrame>
  </>
);

export default React.memo(BlockNotFound);
