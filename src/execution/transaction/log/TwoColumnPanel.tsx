import { FC, PropsWithChildren } from "react";

type TwoColumnProps = {
  leftPanel?: React.ReactNode;
};

const TwoColumnPanel: FC<PropsWithChildren<TwoColumnProps>> = ({
  leftPanel,
  children,
}) => (
  <div className="flex items-baseline space-x-3 text-sm">
    <div className="w-20 text-right">{leftPanel}</div>
    <div className="flex w-full flex-col items-start space-y-2">{children}</div>
  </div>
);

export default TwoColumnPanel;
