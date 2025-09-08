import React from "react";
import ExternalLink from "../components/ExternalLink";
import InfoRow from "../components/InfoRow";
import fallbackTokenIcon from "./fallback-token-icon.svg";
import { KlerosAddressTag } from "./useKleros";

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
          {/* Name field */}
          <InfoRow
            title={
              <span>
                Name (
                <ExternalLink href={tag.data_origin_link}>
                  Kleros Scout
                </ExternalLink>
                )
              </span>
            }
          >
            <span>{tag.name_tag || tag.project_name}</span>
          </InfoRow>

          {/* Project field */}
          {tag.project_name && tag.name_tag && (
            <InfoRow title="Project">
              <span>{tag.project_name}</span>
            </InfoRow>
          )}

          {/* Website field */}
          {tag.website_link && (
            <InfoRow title="Website">
              <ExternalLink href={tag.website_link}>
                {tag.website_link}
              </ExternalLink>
            </InfoRow>
          )}

          {/* Public note field */}
          {tag.public_note && (
            <InfoRow title="Note">
              <span>{tag.public_note}</span>
            </InfoRow>
          )}

          {/* Token attributes */}
          {tag.token_attributes && (
            <InfoRow title="Token">
              <div className="flex items-center gap-2">
                <img
                  src={tag.token_attributes.logo_url || fallbackTokenIcon}
                  alt={tag.token_attributes.token_symbol}
                  className="h-5 w-5 rounded-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = fallbackTokenIcon;
                  }}
                />
                <span>
                  {tag.token_attributes.token_name} (
                  {tag.token_attributes.token_symbol}) -{" "}
                  {tag.token_attributes.decimals} decimal
                  {tag.token_attributes.decimals !== 1 ? "s" : ""}
                </span>
              </div>
            </InfoRow>
          )}

          {/* Verified domains */}
          {tag.verified_domains && tag.verified_domains.length > 0 && (
            <InfoRow title="Verified Domains">
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1">
                {tag.verified_domains.map((domain, idx) => (
                  <li key={idx} className="break-all">
                    <ExternalLink href={`https://${domain}`}>
                      {domain}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </InfoRow>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default KlerosAddressInfo;
