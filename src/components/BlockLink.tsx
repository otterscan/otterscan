import React from "react";
import { NavLink } from "react-router-dom";
import { BlockTag } from "@ethersproject/abstract-provider";
import { commify } from "@ethersproject/units";
import { blockURL } from "../url";

type BlockLinkProps = {
  blockTag: BlockTag;
};

const BlockLink: React.FC<BlockLinkProps> = ({ blockTag }) => {
  const isNum = typeof blockTag === "number";
  let text = blockTag;
  if (isNum) {
    text = commify(blockTag);
  }

  return (
    <NavLink
      className={`text-link-blue hover:text-link-blue-hover ${
        isNum ? "font-blocknum" : "font-hash"
      }`}
      to={blockURL(blockTag)}
    >
      {text}
    </NavLink>
  );
};

export default React.memo(BlockLink);
