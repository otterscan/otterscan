import React from "react";
import ExternalLink from "../components/ExternalLink";
import InfoRow from "../components/InfoRow";
import KlerosLogo from "./KlerosLogo";
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
                Name (<ExternalLink href={tag.data_origin_link}>Kleros Scout</ExternalLink>):
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
                {tag.token_attributes.logo_url && (
                  <img
                    src={tag.token_attributes.logo_url}
                    alt={tag.token_attributes.token_symbol}
                    className="h-5 w-5 rounded-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI0IiB5PSI0Ij4KPHBhdGggZD0iTTYgNkg0VjEwSDZWNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=";
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
            </InfoRow>
          )}

          {/* Verified domains */}
          {tag.verified_domains && tag.verified_domains.length > 0 && (
            <InfoRow title="Verified Domains">
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1">
                {tag.verified_domains.map((domain, idx) => (
                  <li key={idx} className="break-all">
                    <ExternalLink href={`https://${domain}`}>{domain}</ExternalLink>
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
