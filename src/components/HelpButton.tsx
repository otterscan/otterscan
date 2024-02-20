import React from "react";

import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faQuestionCircle as faQuestionCircleSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch } from "@headlessui/react";

type HelpButtonProps = {
  checked: boolean;
  onChange: (newValue: boolean) => void;
};

const HelpButton: React.FC<HelpButtonProps> = ({ checked, onChange }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    className="self-center text-gray-500 pr-2"
  >
    <FontAwesomeIcon
      icon={checked ? faQuestionCircleSolid : faQuestionCircle}
      size="1x"
    />
  </Switch>
);

export default HelpButton;
