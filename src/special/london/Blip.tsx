import React, { useState } from "react";
import { Transition } from "@headlessui/react";

type BlipProps = {
  value: number;
};

const Blip: React.FC<BlipProps> = ({ value }) => {
  const [show, setShow] = useState<boolean>(true);

  return (
    <Transition
      show
      appear
      enter="transition transform ease-in duration-1000 translate-x-full pl-3"
      enterFrom="opacity-100 translate-y-0"
      enterTo="opacity-0 -translate-y-5"
      afterEnter={() => setShow(false)}
    >
      {show && value !== 0 && (
        <div
          className={`absolute bottom-0 font-bold ${
            value > 0 ? "text-green-500" : "text-red-500"
          } text-3xl`}
        >
          {value > 0 ? `+${value}` : `${value}`}
        </div>
      )}
    </Transition>
  );
};

export default React.memo(Blip);
