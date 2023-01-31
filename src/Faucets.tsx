import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFaucetDrip,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import ExternalLink from "./components/ExternalLink";
import ContentFrame from "./ContentFrame";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import { useChainInfo } from "./useChainInfo";

const Faucets: React.FC = () => {
  const { network, faucets } = useChainInfo();
  const loc = useLocation();
  const urls = useMemo(() => {
    const s = new URLSearchParams(loc.search);
    const address = s.get("address");

    const _urls: string[] =
      network === "testnet"
        ? faucets.map((u) =>
            // eslint-disable-next-line no-template-curly-in-string
            address !== null ? u.replaceAll("${ADDRESS}", address) : u
          )
        : [];

    // Shuffle faucets to avoid UI bias
    for (let i = _urls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [_urls[i], _urls[j]] = [_urls[j], _urls[i]];
    }

    return _urls;
  }, [network, faucets, loc]);

  return (
    <StandardFrame>
      <StandardSubtitle>Faucets</StandardSubtitle>
      <ContentFrame>
        <div className="space-y-3 py-4">
          {urls.length > 0 && (
            <div className="flex items-baseline space-x-2 rounded bg-amber-200 px-2 py-1 font-bold text-red-800 underline">
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
            <div className="flex items-baseline space-x-2 rounded bg-amber-200 px-2 py-1 text-amber-700">
              <FontAwesomeIcon
                className="self-center"
                icon={faTriangleExclamation}
                size="1x"
              />
              <span>The faucet links below are shuffled on page load.</span>
            </div>
          )}
          {urls.length > 0 ? (
            <div className="space-y-3 pt-2">
              {urls.map((url) => (
                <div className="flex items-baseline space-x-2">
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
