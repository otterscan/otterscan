import React from "react";

type InfoRowProps = React.PropsWithChildren<{
  title: React.ReactNode;
}>;

const InfoRow: React.FC<InfoRowProps> = ({ title, children }) => (
  <div className="grid grid-cols-4 py-4 text-sm">
    <div>{title}:</div>
    <div className="col-span-3">{children}</div>
  </div>
);

export default React.memo(InfoRow);
