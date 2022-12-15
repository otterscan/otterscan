import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { commify } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare as faSquareRegular } from "@fortawesome/free-regular-svg-icons";
import { SlotAwareComponentProps } from "../types";
import { slotURL } from "../../url";

type SlotLinkProps = SlotAwareComponentProps & {
  missed?: boolean;
  scheduled?: boolean;
};

const SlotLink: FC<SlotLinkProps> = ({ slotNumber, missed, scheduled }) => {
  let text = commify(slotNumber);

  return (
    <NavLink
      className={`flex space-x-2 items-baseline ${
        missed
          ? "line-through text-red-500 hover:text-red-800"
          : "text-link-blue hover:text-link-blue-hover"
      } font-blocknum`}
      to={slotURL(slotNumber)}
    >
      <FontAwesomeIcon
        className="self-center"
        icon={missed || scheduled ? faSquareRegular : faSquare}
        size="1x"
      />
      <span>{text}</span>
    </NavLink>
  );
};

export default memo(SlotLink);
