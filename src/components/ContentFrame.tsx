import { FC, PropsWithChildren } from "react";

type ContentFrameProps = {
  tabs?: boolean;
  isLoading?: boolean;
};

const ContentFrame: FC<PropsWithChildren<ContentFrameProps>> = ({
  tabs,
  isLoading,
  children,
}) => {
  return tabs ? (
    <div
      className={`divide-y rounded-b-lg border bg-white px-3 ${
        isLoading && "opacity-10 transition-opacity"
      }`}
    >
      {children}
    </div>
  ) : (
    <div
      className={`divide-y rounded-lg border bg-white px-3 ${
        isLoading && "opacity-10 transition-opacity"
      }`}
    >
      {children}
    </div>
  );
};

export default ContentFrame;
