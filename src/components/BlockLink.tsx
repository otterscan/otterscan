import { faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BlockTag } from "ethers";
import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { blockURL } from "../url";
import { commify } from "../utils/utils";

type BlockLinkProps = {
  blockTag: BlockTag;
};

const BlockLink: FC<BlockLinkProps> = ({ blockTag }) => {
  let text = blockTag;
  let isNum = typeof blockTag === "bigint" || typeof blockTag === "number";
  if (isNum) {
    text = commify(blockTag);
  }

  return (
    <NavLink
      className={`flex-inline items-baseline space-x-1 break-all text-link-blue hover:text-link-blue-hover ${
        isNum ? "font-blocknum" : "font-hash"
      }`}
      to={blockURL(blockTag)}
    >
      <span className="text-orange-500">
        <FontAwesomeIcon className="self-center" icon={faCube} size="1x" />
      </span>
      <span>{text.toString()}</span>
    </NavLink>
  );
};

export default memo(BlockLink);
