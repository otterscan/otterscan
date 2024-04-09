import { faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BlockTag } from "ethers";
import { FC, memo } from "react";
import { blockURL } from "../url";
import { commify } from "../utils/utils";
import ExternalLink from "./ExternalLink";

type ExternalBlockLinkProps = {
  blockTag: BlockTag;
  explorerUrl?: string;
};

const ExternalBlockLink: FC<ExternalBlockLinkProps> = ({
  explorerUrl,
  blockTag,
}) => {
  let text = blockTag;
  let isNum = typeof blockTag === "bigint" || typeof blockTag === "number";
  if (isNum) {
    text = commify(blockTag);
  }

  const interior = (
    <div
      className={`flex-inline items-baseline space-x-1 break-all ${isNum ? "font-blocknum" : "font-hash"}`}
    >
      <span className="text-blue-400">
        <FontAwesomeIcon className="self-center" icon={faCube} size="1x" />
      </span>
      <span>{text.toString()}</span>
    </div>
  );

  if (explorerUrl) {
    return (
      <ExternalLink href={explorerUrl + blockURL(blockTag)}>
        {interior}
      </ExternalLink>
    );
  }

  return interior;
};

export default memo(ExternalBlockLink);
