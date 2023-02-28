import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import NavButton from "../components/NavButton";

type NavBlockProps = {
  entityNum: number;
  latestEntityNum: number | undefined;
  urlBuilder: (blockNumber: number) => string;
};

const NavBlock: FC<NavBlockProps> = ({
  entityNum,
  latestEntityNum,
  urlBuilder,
}) => (
  <div className="flex space-x-1 self-center pl-2">
    <NavButton href={urlBuilder(entityNum - 1)} disabled={entityNum === 0}>
      <FontAwesomeIcon icon={faChevronLeft} />
    </NavButton>
    <NavButton
      href={urlBuilder(entityNum + 1)}
      disabled={latestEntityNum === undefined || entityNum >= latestEntityNum}
    >
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
    <NavButton
      href={urlBuilder(latestEntityNum!)}
      disabled={latestEntityNum === undefined || entityNum >= latestEntityNum}
    >
      <FontAwesomeIcon icon={faChevronRight} />
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
  </div>
);

export default memo(NavBlock);
