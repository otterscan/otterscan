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
                      <button className="text-xs text-gray-600 hover:text-blue-500 transition-colors">
                        {tag.verified_domains.length} domains
                      </button>
                      <div className="hidden group-hover:block absolute z-10 bg-gray-900 border border-gray-700 rounded shadow-xl p-3 mt-1 min-w-max ">
                        <div className="flex items-center mb-2 text-xs font-medium text-white">
                          <svg
                            className="h-3 w-3 mr-1"
                            viewBox="0 0 1445 1445"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g transform="translate(41.000000, 117.000000)" fill="#FFFFFF">
                              <path d="M400.202936,0 L1085.53556,30.5930708 L1363,646.292053 L971.549202,1209 L282.490982,1164.93034 L0,497.824333 L400.202936,0 Z M902.643081,354.903686 L405.958198,571.629314 L830.592822,899.523948 L902.643081,354.903686 Z M845.138906,246.304517 L448.205988,75.6167542 L364.825362,434.495521 L845.138906,246.304517 Z M744.530277,982.025113 L313.141344,674.384045 L323.576299,1091.256 L744.530277,982.025113 Z M1294.09593,644.934076 L1000.12639,347.017989 L922.535789,919.897844 L1294.09593,644.934076 Z M845.672707,1049.03421 L481.852689,1144.00208 L909.703034,1171.36352 L845.672707,1049.03421 Z M1236.64772,780.099671 L918.174978,1017.03589 L981.45626,1140.54698 L1236.64772,780.099671 Z M1086.00813,116.618087 L1024.15176,243.438162 L1254.39231,477.177133 L1086.00813,116.618087 Z M1008.93842,55.9304419 L604.631289,39.5402223 L938.136562,185.22581 L1008.93842,55.9304419 Z M341.161607,114.57683 L57.9714108,471.706563 L247.307286,511.758173 L341.161607,114.57683 Z M235.890826,581.814115 L45.6423228,541.58631 L244.151832,1008.6431 L235.890826,581.814115 Z" />
                            </g>
                          </svg>
                          <span>Verified by Kleros:</span>
                        </div>
                        <ul className="text-sm text-gray-200 list-disc pl-4 space-y-0.5">
                          {tag.verified_domains.map((domain, idx) => (
                            <li key={idx} className="break-all">{domain}</li>
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