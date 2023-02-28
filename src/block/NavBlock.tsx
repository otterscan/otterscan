import { FC, memo } from "react";
import { BlockTag } from "@ethersproject/abstract-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import NavButton from "../components/NavButton";

type NavBlockProps = {
  blockNumber: number;
  latestBlockNumber: number | undefined;
  urlBuilder: (blockNumber: BlockTag) => string;
};

const NavBlock: FC<NavBlockProps> = ({
  blockNumber,
  latestBlockNumber,
  urlBuilder,
}) => (
  <div className="flex space-x-1 self-center pl-2">
    <NavButton href={urlBuilder(blockNumber - 1)} disabled={blockNumber === 0}>
      <FontAwesomeIcon icon={faChevronLeft} />
    </NavButton>
    <NavButton
      href={urlBuilder(blockNumber + 1)}
      disabled={
        latestBlockNumber === undefined || blockNumber >= latestBlockNumber
      }
    >
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
    <NavButton
      href={urlBuilder(latestBlockNumber!)}
      disabled={
        latestBlockNumber === undefined || blockNumber >= latestBlockNumber
      }
    >
      <FontAwesomeIcon icon={faChevronRight} />
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
  </div>
);

export default memo(NavBlock);
