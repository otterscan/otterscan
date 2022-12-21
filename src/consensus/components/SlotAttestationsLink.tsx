import { FC, memo, PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { SlotAwareComponentProps } from "../types";
import { slotAttestationsURL } from "../../url";

const SlotAttestationsLink: FC<PropsWithChildren<SlotAwareComponentProps>> = ({
  slotNumber,
  children,
}) => (
  <NavLink
    className={`flex space-x-1 items-baseline text-link-blue hover:text-link-blue-hover font-blocknum`}
    to={slotAttestationsURL(slotNumber)}
  >
    <FontAwesomeIcon className="self-center" icon={faCircleCheck} size="1x" />
    <span>{children}</span>
  </NavLink>
);

export default memo(SlotAttestationsLink);
