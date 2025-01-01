import React from "react";

type InfoRowProps = React.PropsWithChildren<{
  title: React.ReactNode;
}>;

const InfoRow: React.FC<InfoRowProps> = ({ title, children }) => (
  <div className="sm:grid sm:grid-cols-4 py-3 sm:py-4 text-sm">
    <div className="mb-1 sm:mb-auto">{title}:</div>
    <div className="sm:col-span-3">{children}</div>
  </div>
);

export default React.memo(InfoRow);
