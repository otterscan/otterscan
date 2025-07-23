import React from "react";

type InfoRowProps = React.PropsWithChildren<{
  title: React.ReactNode;
  noColon?: boolean;
}>;

const InfoRow: React.FC<InfoRowProps> = ({
  title,
  children,
  noColon = false,
}) => (
  <div className="sm:grid sm:grid-cols-4 py-3 sm:py-4 text-sm">
    <div className="mb-2 sm:mb-auto">
      {title}
      {noColon ? "" : ":"}
    </div>
    <div className="sm:col-span-3">{children}</div>
  </div>
);

export default React.memo(InfoRow);
