import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "@headlessui/react";

type BCInfoToolTipProps = {
  child: React.ReactNode,
};

const BCInfoToolTip: React.FC<BCInfoToolTipProps> = ({ child }) => {

  return (
    <Menu>
      <span>
        <Menu.Button className="rounded">
          <FontAwesomeIcon icon={faInfoCircle} size="1x" />
        </Menu.Button>
        <Menu.Items className="absolute mt-2 flex min-w-max flex-col rounded-b border bg-white p-1 text-sm">
          <div className="w-60 text-xs">
            { child } 
          </div>
        </Menu.Items>
      </span>
    </Menu>
  );
};

export default BCInfoToolTip;
