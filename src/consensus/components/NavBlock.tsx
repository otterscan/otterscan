import { FC, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import NavButton from "./NavButton";

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
  <div className="pl-2 self-center flex space-x-1">
    <NavButton
      entityNum={entityNum - 1}
      disabled={
        entityNum === 0 ||
        (latestEntityNum !== undefined && entityNum > latestEntityNum)
      }
      urlBuilder={urlBuilder}
    >
      <FontAwesomeIcon icon={faChevronLeft} />
    </NavButton>
    <NavButton
      entityNum={entityNum + 1}
      disabled={latestEntityNum === undefined || entityNum >= latestEntityNum}
      urlBuilder={urlBuilder}
    >
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
    <NavButton
      entityNum={latestEntityNum!}
      disabled={latestEntityNum === undefined || entityNum >= latestEntityNum}
      urlBuilder={urlBuilder}
    >
      <FontAwesomeIcon icon={faChevronRight} />
      <FontAwesomeIcon icon={faChevronRight} />
    </NavButton>
  </div>
);

export default memo(NavBlock);
