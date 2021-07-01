import React from "react";

type ContentFrameProps = {
  tabs?: boolean;
};

const ContentFrame: React.FC<ContentFrameProps> = ({ tabs, children }) => {
  return tabs ? (
    <div className="divide-y border rounded-b-lg px-3 bg-white">{children}</div>
  ) : (
    <div className="divide-y border rounded-lg px-3 bg-white">{children}</div>
  );
};

export default ContentFrame;
