import React, { useState } from "react";
import InfoRow from "../components/InfoRow";
import KlerosLogo from "./KlerosLogo";
import { KlerosAddressTag } from "./useKleros";
import ExternalLink from "../components/ExternalLink";

type KlerosAddressInfoProps = {
  tags: KlerosAddressTag[];
};

const KlerosAddressInfo: React.FC<KlerosAddressInfoProps> = ({ tags }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <>
      {tags.map((tag, index) => (
        <React.Fragment key={index}>
          <InfoRow
            noColon
            title={
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <KlerosLogo />
                <span>Verified Info by</span>
                <ExternalLink href={tag.data_origin_link}>
                  Kleros Scout
                </ExternalLink>
                <span>:</span>
              </div>
            }
          >
            <div className="space-y-1">
              {/* Project name and tag */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {tag.project_name && (
                  <>
                    <span className="font-semibold">{tag.project_name}</span>
                    {tag.name_tag && (
                      <>
                        <span className="text-gray-600 dark:text-gray-400">•</span>
                        <span className="text-sm">{tag.name_tag}</span>
                      </>
                    )}
                  </>
                )}
                {!tag.project_name && tag.name_tag && (
                  <span className="text-sm">{tag.name_tag}</span>
                )}
                {tag.website_link && (
                  <>
                    {(tag.project_name || tag.name_tag) && (
                      <span className="text-gray-600 dark:text-gray-400">•</span>
                    )}
                    <ExternalLink href={tag.website_link}>
                      <span className="text-sm">{tag.website_link}</span>
                    </ExternalLink>
                  </>
                )}
              </div>

              {/* Public note */}
              {tag.public_note && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {tag.public_note}
                </div>
              )}

              {/* Token attributes */}
              {tag.token_attributes && (
                <div className="flex items-center gap-2">
                  {tag.token_attributes.logo_url && (
                    <img
                      src={tag.token_attributes.logo_url}
                      alt={tag.token_attributes.token_symbol}
                      className="h-5 w-5 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <span className="text-sm">
                    <span className="font-medium">
                      {tag.token_attributes.token_name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 mx-1">
                      •
                    </span>
                    <span>{tag.token_attributes.token_symbol}</span>
                    <span className="text-gray-600 dark:text-gray-400 mx-1">
                      •
                    </span>
                    <span>{tag.token_attributes.decimals} decimals</span>
                  </span>
                </div>
              )}

              {/* Verified domains - always show first 2, expandable for more */}
              {tag.verified_domains && tag.verified_domains.length > 0 && (
                <VerifiedDomains domains={tag.verified_domains} />
              )}
            </div>
          </InfoRow>
        </React.Fragment>
      ))}
    </>
  );
};

export default KlerosAddressInfo;

// Always show first 2 domains, expandable for more
const VerifiedDomains: React.FC<{ domains: string[] }> = ({ domains }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (domains.length <= 2) {
    return (
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified domains:</div>
        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-0.5">
          {domains.map((domain, idx) => (
            <li key={idx} className="break-all">
              <ExternalLink href={`https://${domain}`}>
                {domain}
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (expanded) {
    return (
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified domains:</div>
        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-0.5">
          {domains.map((domain, idx) => (
            <li key={idx} className="break-all">
              <ExternalLink href={`https://${domain}`}>
                {domain}
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Show first domain + "show N more" link
  return (
    <div className="text-sm text-gray-700 dark:text-gray-300">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verified domains:</div>
      <ul className="list-disc pl-5 space-y-0.5">
        <li className="break-all">
          <ExternalLink href={`https://${domains[0]}`}>
            {domains[0]}
          </ExternalLink>
        </li>
      </ul>
      <button
        onClick={() => setExpanded(true)}
        className="text-link-blue hover:text-link-blue-hover text-xs ml-5 mt-1"
      >
        (show {domains.length - 1} more domains)
      </button>
    </div>
  );
};
