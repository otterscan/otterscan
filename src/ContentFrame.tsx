import React, { PropsWithChildren } from "react";

type ContentFrameProps = {
  tabs?: boolean;
};

const ContentFrame: React.FC<PropsWithChildren<ContentFrameProps>> = ({
  tabs,
  children,
}) => {
  return tabs ? (
    <div className="divide-y rounded-b-lg border bg-white px-3">{children}</div>
  ) : (
    <div className="divide-y rounded-lg border bg-white px-3">{children}</div>
  );
};

export default ContentFrame;
