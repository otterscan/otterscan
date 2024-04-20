import { faSquare as faSquareRegular } from "@fortawesome/free-regular-svg-icons";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";
import { NavLink } from "react-router-dom";
import { slotURL } from "../../url";
import { commify } from "../../utils/utils";

type SlotLinkProps = {
  slot: number | string;
  missed?: boolean;
  scheduled?: boolean;
  slashings?: boolean;
};

const SlotLink: FC<SlotLinkProps> = ({
  slot,
  missed,
  scheduled,
  slashings,
}) => {
  const isNum = typeof slot === "number";
  let text = isNum ? commify(slot) : slot;

  return (
    <NavLink
      className={`flex items-baseline ${
        missed
          ? "text-red-500 line-through hover:text-red-800"
          : "text-link-blue hover:text-link-blue-hover"
      } ${isNum ? "font-blocknum space-x-2" : "font-hash space-x-1"}`}
      to={slotURL(slot)}
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
