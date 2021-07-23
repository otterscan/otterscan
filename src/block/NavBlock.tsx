import React from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import NavButton from "./NavButton";

type NavBlockProps = {
  blockNumber: number;
  latestBlockNumber: number | undefined;
  urlBuilder?: (blockNumber: ethers.providers.BlockTag) => string;
};

const NavBlock: React.FC<NavBlockProps> = ({
  blockNumber,
  latestBlockNumber,
  urlBuilder,
}) => (
  <div className="pl-2 self-center flex space-x-1">
    <NavButton
      blockNum={blockNumber - 1}
      disabled={blockNumber === 0}
      urlBuilder={urlBuilder}
    >
      <FontAwesomeIcon icon={faChevronLeft} />
    </NavButton>
    <NavButton
      blockNum={blockNumber + 1}
      disabled={
        latestBlockNumber === undefined || blockNumber >= latestBlockNumber
      }
      urlBuilder={urlBuilder}
    >
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
    <NavButton
      blockNum={latestBlockNumber!}
      disabled={
        latestBlockNumber === undefined || blockNumber >= latestBlockNumber
      }
      urlBuilder={urlBuilder}
    >
      <FontAwesomeIcon icon={faChevronRight} />
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
  </div>
);

export default React.memo(NavBlock);
