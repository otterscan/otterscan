import { FC, PropsWithChildren, useEffect, useState } from "react";
import { NavLink } from "react-router";

type LinkToSourceRegionProps = {
  targetAddr: string;
  targetStart?: number;
  targetEnd?: number;
  targetSource?: string;
} & PropsWithChildren;

const LinkToSourceRegion: FC<LinkToSourceRegionProps> = ({
  targetAddr,
  targetStart,
  targetEnd,
  targetSource,
  children,
}) => {
  const [safeUrl, setSafeUrl] = useState<string>();

  useEffect(() => {
    const searchParams = new URLSearchParams();

    if (targetStart !== undefined && targetEnd !== undefined) {
      searchParams.append("hr", `${targetStart}-${targetEnd}`);
    }

    if (targetSource !== undefined) {
      searchParams.append("source", targetSource);
    }

    const url = `/address/${encodeURIComponent(targetAddr)}/contract?${searchParams.toString()}`;
    setSafeUrl(url);
  }, [targetAddr, targetStart, targetEnd, targetSource]);

  if (!safeUrl) {
    return null;
  }

  return (
    <NavLink className="text-link-blue hover:text-link-blue-hover" to={safeUrl}>
      {children}
    </NavLink>
  );
};

export default LinkToSourceRegion;
