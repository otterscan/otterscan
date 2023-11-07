import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { NavLink } from "react-router-dom";
import { epochURL } from "../../url";
import { commify } from "../../utils/utils";
import { EpochAwareComponentProps } from "../types";

const EpochLink: FC<EpochAwareComponentProps> = ({ epochNumber }) => {
  let text = commify(epochNumber);

  return (
    <NavLink
      className="flex items-baseline space-x-1 font-blocknum text-link-blue hover:text-link-blue-hover"
      to={epochURL(epochNumber)}
    >
      <FontAwesomeIcon className="self-center" icon={faList} size="1x" />
      <span>{text}</span>
    </NavLink>
  );
};

export default EpochLink;
