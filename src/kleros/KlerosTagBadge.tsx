import React from "react";
import { KlerosAddressTag } from "./useKleros";
import KlerosLogo from "./KlerosLogo";

type KlerosTagBadgeProps = {
  tag: KlerosAddressTag;
  address: string;
  compact?: boolean;
};

const KlerosTagBadge: React.FC<KlerosTagBadgeProps> = ({ tag, address, compact = false }) => {
  const displayName = compact ? tag.name_tag : `${tag.project_name}: ${tag.name_tag}`;
  
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
          <a
            href={tag.website_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 ml-1"
            title="Visit project website"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default KlerosTagBadge;