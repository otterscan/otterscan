import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet } from "@fortawesome/free-solid-svg-icons";

import { fromBech32Address, toBech32Address } from '@zilliqa-js/crypto'
import { validation } from '@zilliqa-js/util'

type AddressSwapProps = {
  addr: string;
};

const AddressSwap: React.FC<AddressSwapProps> = ({addr}) => {
  const [addrPair, setAddrPair] = useState<string[] | null>(null) // [bech32, hex]
  const [toggle, setToggle] = useState(0)

  useEffect(() => {
    try {
      validation.isAddress(addr) ? 
      setAddrPair([addr, toBech32Address(addr)]) : 
      setAddrPair([addr, "Invalid hex-encoded address"])
      //setAddrPair([toBech32Address(addr), addr])
    }
    catch(e) {
      setAddrPair([addr, "toBech32Address(addr)"])
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
    </>

  );
};

export default React.memo(AddressSwap);