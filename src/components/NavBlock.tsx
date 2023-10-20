import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";
import NavButton from "./NavButton";

type NavBlockProps = {
  entityNum: number;
  latestEntityNum: number | undefined;
  urlBuilder: (n: number) => string;
  showFirstLink?: boolean;
};

const NavBlock: FC<NavBlockProps> = ({
  entityNum,
  latestEntityNum,
  urlBuilder,
  showFirstLink = false,
}) => (
  <div className="flex space-x-1 self-center pl-2">
    {showFirstLink && (
      <NavButton href={urlBuilder(0)} disabled={entityNum === 0}>
        <FontAwesomeIcon icon={faChevronLeft} />
        <FontAwesomeIcon icon={faChevronLeft} />
      </NavButton>
    )}
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
