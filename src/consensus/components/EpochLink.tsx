import { FC } from "react";
import { NavLink } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { epochURL } from "../../url";

type EpochLinkProps = {
  epochNumber: number;
};

const EpochLink: FC<EpochLinkProps> = ({ epochNumber }) => {
  let text = commify(epochNumber);

  return (
    <NavLink
      className="flex space-x-2 items-baseline text-link-blue hover:text-link-blue-hover font-blocknum"
      to={epochURL(epochNumber)}
    >
      <FontAwesomeIcon className="self-center" icon={faList} size="1x" />
      <span>{text}</span>
    </NavLink>
  );
};

export default EpochLink;
