import { FC } from "react";
import ContentLoader from "react-content-loader";

const OverviewSkeleton: FC = () => (
  <ContentLoader viewBox="0 0 300 12">
    <rect x="0" y="4" rx="1" ry="1" width="70" height="4" />
    <rect x="75" y="4" rx="1" ry="1" width="100" height="4" />
  </ContentLoader>
);

export default OverviewSkeleton;
