import React from "react";
import { NavLink } from "react-router-dom";
import { ethers } from "ethers";

type BlockLinkProps = {
  blockTag: ethers.providers.BlockTag;
};

const BlockLink: React.FC<BlockLinkProps> = ({ blockTag }) => {
  const isNum = typeof blockTag === "number";
  let text = blockTag;
  if (isNum) {
    text = ethers.utils.commify(blockTag);
  }

  return (
    <NavLink
      className={`text-link-blue hover:text-link-blue-hover ${
        isNum ? "font-blocknum" : "font-hash"
      }`}
      to={`/block/${blockTag}`}
    >
      {text}
    </NavLink>
  );
};

export default React.memo(BlockLink);
