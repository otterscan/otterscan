import React from "react";
import KlerosLogo from "./KlerosLogo";
import { KlerosAddressTag } from "./useKleros";
import ExternalLink from "../components/ExternalLink";

type KlerosTagBadgeProps = {
  tag: KlerosAddressTag;
  address: string;
  compact?: boolean;
};

const KlerosTagBadge: React.FC<KlerosTagBadgeProps> = ({
  tag,
  address,
  compact = false,
}) => {
  const displayName = compact
    ? tag.name_tag
    : `${tag.project_name}: ${tag.name_tag}`;

  return (
    <div className="rounded-lg bg-blue-100 dark:bg-blue-900 px-2 py-1 text-sm text-blue-800 dark:text-blue-200 text-nowrap">
      <div className="flex items-center space-x-1">
        <KlerosLogo />
        <span
          className="text-nowrap"
          title={tag.public_note || `${tag.project_name}: ${tag.name_tag}`}
        >
          {displayName}
        </span>

        {tag.website_link && !compact && (
          <ExternalLink href={tag.website_link}>
          </ExternalLink>
        )}
      </div>
    </div>
  );
};

export default KlerosTagBadge;
