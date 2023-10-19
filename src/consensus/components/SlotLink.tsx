import { faSquare as faSquareRegular } from "@fortawesome/free-regular-svg-icons";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { slotURL } from "../../url";
import { commify } from "../../utils/utils";
import { SlotAwareComponentProps } from "../types";

type SlotLinkProps = SlotAwareComponentProps & {
  missed?: boolean;
  scheduled?: boolean;
  slashings?: boolean;
};

const SlotLink: FC<SlotLinkProps> = ({
  slotNumber,
  missed,
  scheduled,
  slashings,
}) => {
  let text = commify(slotNumber);

  return (
    <NavLink
      className={`flex items-baseline space-x-2 ${
        missed
          ? "text-red-500 line-through hover:text-red-800"
          : "text-link-blue hover:text-link-blue-hover"
      } font-blocknum`}
      to={slotURL(slotNumber)}
    >
      <FontAwesomeIcon
        className={`self-center ${slashings ? "text-red-600" : ""}`}
        icon={missed || scheduled ? faSquareRegular : faSquare}
        size="1x"
      />
      <span>{text}</span>
    </NavLink>
  );
};

export default memo(SlotLink);
