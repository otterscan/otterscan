import { FC } from "react";
import ContentLoader from "react-content-loader";

const PendingItem: FC = () => (
  <div className="p-1">
    <ContentLoader
      className="h-4 w-full"
      viewBox="0 0 100 100"
      speed={2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      preserveAspectRatio="none"
    >
      <rect x="0" y="0" width="100" height="100" rx="4" ry="4" />
    </ContentLoader>
  </div>
);

export default PendingItem;
