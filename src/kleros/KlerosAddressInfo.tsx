import React, { useState } from "react";
import InfoRow from "../components/InfoRow";
import KlerosLogo from "./KlerosLogo";
import { KlerosAddressTag } from "./useKleros";
import ExternalLink from "../components/ExternalLink";
import LabeledSwitch from "../components/LabeledSwitch";

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
                <span>Project:</span>
              </div>
            }
          >
            <div className="space-y-1">
              {/* Project name and tag */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold">{tag.project_name}</span>
                <span className="text-gray-600 dark:text-gray-400">•</span>
                <span className="text-sm">{tag.name_tag}</span>
                {tag.website_link && (
                  <>
                    <span className="text-gray-600 dark:text-gray-400">•</span>
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

              {/* Verified domains - collapsible section */}
              {tag.verified_domains && tag.verified_domains.length > 0 && (
                <VerifiedDomains domains={tag.verified_domains} />
              )}

              {/* Source link */}
              <div className="flex items-center justify-between">
                <ExternalLink href={tag.data_origin_link}>
                  <span className="text-xs">View on Kleros Scout →</span>
                </ExternalLink>
              </div>
            </div>
          </InfoRow>
        </React.Fragment>
      ))}
    </>
  );
};

export default KlerosAddressInfo;

// Collapsible verified domains list mirroring the Read Contract toggle UX
const VerifiedDomains: React.FC<{ domains: string[] }> = ({ domains }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  return (
    <div className="mt-2">
      <LabeledSwitch defaultEnabled={expanded} onToggle={setExpanded}>
        Show verified domains ({domains.length})
      </LabeledSwitch>
      {expanded && (
        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-0.5">
          {domains.map((domain, idx) => (
            <li key={idx} className="break-all">
              <ExternalLink href={`https://${domain}`}>
                {domain}
              </ExternalLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
