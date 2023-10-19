import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo, PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { slotAttestationsURL } from "../../url";
import { SlotAwareComponentProps } from "../types";

const SlotAttestationsLink: FC<PropsWithChildren<SlotAwareComponentProps>> = ({
  slotNumber,
  children,
}) => (
  <NavLink
    className={`flex items-baseline space-x-1 font-blocknum text-link-blue hover:text-link-blue-hover`}
    to={slotAttestationsURL(slotNumber)}
  >
    <FontAwesomeIcon className="self-center" icon={faCircleCheck} size="1x" />
    <span>{children}</span>
  </NavLink>
);

export default memo(SlotAttestationsLink);
