import React from "react";
import InfoRow from "../components/InfoRow";
import { KlerosAddressTag } from "./useKleros";
import KlerosLogo from "./KlerosLogo";

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
          <InfoRow title={
            <div className="flex items-center space-x-2">
              <KlerosLogo />
              <span>Project</span>
            </div>
          }>
            <div className="space-y-1">
              {/* Project name and tag */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold">{tag.project_name}</span>
                <span className="text-gray-600 dark:text-gray-400">•</span>
                <span className="text-sm">{tag.name_tag}</span>
                {tag.website_link && (
                  <>
                    <span className="text-gray-600 dark:text-gray-400">•</span>
                    <a
                      href={tag.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm"
                      style={{ color: 'var(--color-link-blue)' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-link-blue-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-link-blue)'}
                    >
                      {tag.website_link}
                    </a>
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
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-sm">
                    <span className="font-medium">{tag.token_attributes.token_name}</span>
                    <span className="text-gray-600 dark:text-gray-400 mx-1">•</span>
                    <span>{tag.token_attributes.token_symbol}</span>
                    <span className="text-gray-600 dark:text-gray-400 mx-1">•</span>
                    <span>{tag.token_attributes.decimals} decimals</span>
                  </span>
                </div>
              )}

              {/* Verified domains - show all but in a compact grid */}
              {tag.verified_domains && tag.verified_domains.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">
                    Verified domains ({tag.verified_domains.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                    {tag.verified_domains.map((domain, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded truncate"
                        title={domain}
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source link */}
              <div className="flex items-center justify-between">
                <a
                  href={tag.data_origin_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs"
                  style={{ color: 'var(--color-link-blue)' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-link-blue-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-link-blue)'}
                >
                  View on Kleros Scout →
                </a>
              </div>
            </div>
          </InfoRow>
        </React.Fragment>
      ))}
    </>
  );
};

export default KlerosAddressInfo;