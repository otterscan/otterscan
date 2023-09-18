import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { BlockTag } from "@ethersproject/abstract-provider";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/free-solid-svg-icons";
import { dsBlockURL } from "../url";

type DSBlockLinkProps = {
  blockTag: BlockTag;
};

const DSBlockLink: FC<DSBlockLinkProps> = ({ blockTag }) => {
  const isNum = typeof blockTag === "number";
  let text = blockTag;
  if (isNum) {
    text = commify(blockTag);
  }

  return (
    <NavLink
      className={`flex-inline items-baseline space-x-1 text-link-blue hover:text-link-blue-hover ${
        isNum ? "font-blocknum" : "font-hash"
      }`}
      to={dsBlockURL(blockTag)}
    >
      <span className="text-orange-500">
        <FontAwesomeIcon className="self-center" icon={faCube} size="1x" />
      </span>
      <span>{text}</span>
    </NavLink>
  );
};

export default memo(DSBlockLink);
