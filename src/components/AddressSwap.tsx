import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet } from "@fortawesome/free-solid-svg-icons";

import { fromBech32Address, toBech32Address } from '@zilliqa-js/crypto'
import { validation } from '@zilliqa-js/util'
import Copy from "./Copy";

type AddressSwapProps = {
  addr: string;
};

const AddressSwap: React.FC<AddressSwapProps> = ({addr}) => {
  const [addrPair, setAddrPair] = useState<string[] | null>(null) // [bech32, hex]
  const [toggle, setToggle] = useState(0)

  useEffect(() => {
    try {
      setAddrPair([addr, toBech32Address(addr)])
    }
    catch(e) {
      setAddrPair([addr, "Invalid hex-encoded address"])
    }

  }, [addr])

  return (
    addrPair && 
    <>
      <span className="font-address text-base text-gray-500">
        {addrPair[toggle]}
      </span>
      <button
        className={`self-center flex flex-no-wrap justify-center items-center space-x-1 text-gray-500 focus:outline-none 
        transition-colors transition-shadows bg-gray-200 hover:bg-gray-500 hover:text-gray-200 hover:shadow w-7 h-7 rounded-full text-xs`}
        title="Switch Address Form"
        onClick={() => {
          setToggle((prevToggle) => prevToggle === 0 ? 1 : 0)
        }}
      >
      <FontAwesomeIcon size='sm' icon={faRetweet} />
      </button>
      <Copy value={addrPair[toggle]} rounded />
    </>

  );
};

export default React.memo(AddressSwap);