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
          <InfoRow 
            noColon
            title={
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <KlerosLogo />
                <span>Project:</span>
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

              {/* Verified domains - hover to view */}
              {tag.verified_domains && tag.verified_domains.length > 0 && (
                <div>
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <span className="mr-1">
                      Verified domains:
                    </span>
                    <div className="group relative inline-block">
                      <button className="text-xs text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                        {tag.verified_domains.length} domains
                      </button>
                      <div className="hidden group-hover:block absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 mt-1 min-w-max">
                        <div className="flex items-center mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                          <KlerosLogo className="h-3 w-3 mr-1" />
                          Verified by Kleros:
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4">
                          {tag.verified_domains.map((domain, idx) => (
                            <li key={idx}>{domain}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
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