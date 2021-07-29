import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

type ExternalLinkProps = {
  href: string;
};

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => (
  <a
    className="text-link-blue hover:text-link-blue-hover"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span className="inline-flex items-baseline space-x-1">
      <span>{children}</span>
      <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" />
    </span>
  </a>
);

export default ExternalLink;
