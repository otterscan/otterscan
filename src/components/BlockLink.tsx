import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { BlockTag } from "@ethersproject/abstract-provider";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/free-solid-svg-icons";
import { blockURL } from "../url";

type BlockLinkProps = {
  blockTag: BlockTag;
};

const BlockLink: FC<BlockLinkProps> = ({ blockTag }) => {
  const isNum = typeof blockTag === "number";
  let text = blockTag;
  if (isNum) {
    text = commify(blockTag);
  }

  return (
    <NavLink
      className={`flex-inline space-x-1 items-baseline text-link-blue hover:text-link-blue-hover ${
        isNum ? "font-blocknum" : "font-hash"
      }`}
      to={blockURL(blockTag)}
    >
      <span className="text-orange-500">
        <FontAwesomeIcon className="self-center" icon={faCube} size="1x" />
      </span>
      <span>{text}</span>
    </NavLink>
  );
};

export default memo(BlockLink);
