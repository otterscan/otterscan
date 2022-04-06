import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons/faTriangleExclamation";
import { faFaucetDrip } from "@fortawesome/free-solid-svg-icons/faFaucetDrip";
import ExternalLink from "./components/ExternalLink";
import ContentFrame from "./ContentFrame";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import { useChainInfo } from "./useChainInfo";
const Faucets: React.FC = () => {
  const { faucets } = useChainInfo();
  const loc = useLocation();
  const urls = useMemo(() => {
    const s = new URLSearchParams(loc.search);
    const address = s.get("address");

    const _urls = faucets.map((u) =>
      address !== null ? u.replaceAll("${ADDRESS}", address) : u
    );

    // Shuffle faucets to avoid UI bias
    for (let i = _urls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [_urls[i], _urls[j]] = [_urls[j], _urls[i]];
    }

    return _urls;
  }, [faucets, loc]);

  return (
    <StandardFrame>
      <StandardSubtitle>Faucets</StandardSubtitle>
      <ContentFrame>
        <div className="py-4 space-y-3">
          {urls.length > 0 && (
            <div className="flex space-x-2 items-baseline rounded bg-yellow-200 text-red-800 font-bold underline px-2 py-1">
              <FontAwesomeIcon
                className="self-center"
                icon={faTriangleExclamation}
                size="1x"
              />
              <span>
                The following external links come from
                https://github.com/ethereum-lists/chains and are *NOT* endorsed
                by us. Use at your own risk.
              </span>
            </div>
          )}
          {/* Display the shuffling notice only if there are 1+ faucets */}
          {urls.length > 1 && (
            <div className="flex space-x-2 items-baseline rounded bg-yellow-200 text-yellow-700 px-2 py-1">
              <FontAwesomeIcon
                className="self-center"
                icon={faTriangleExclamation}
                size="1x"
              />
              <span>The faucet links below are shuffled on page load.</span>
            </div>
          )}
          {urls.length > 0 ? (
            <div className="pt-2 space-y-3">
              {urls.map((url) => (
                <div className="flex space-x-2 items-baseline">
                  <FontAwesomeIcon
                    className="text-gray-400"
                    icon={faFaucetDrip}
                    size="1x"
                  />
                  <ExternalLink key={url} href={url}>
                    <span>{url}</span>
                  </ExternalLink>
                </div>
              ))}
            </div>
          ) : (
            <div>There are no registered faucets.</div>
          )}
        </div>
      </ContentFrame>
    </StandardFrame>
  );
};

export default Faucets;
