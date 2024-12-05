import { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { NavLink } from "react-router";
import { queryClient } from "../../../queryClient";
import SourcifyLogo from "../../../sourcify/SourcifyLogo";
import {
  getContractQuery,
  useSourcifyMetadata,
  useSourcifySources,
} from "../../../sourcify/useSourcify";
import { useAppConfigContext } from "../../../useAppConfig";
import { RuntimeContext } from "../../../useRuntime";
import { getLineNumber } from "./traceInterpreter";

/**
 * Extracts a filename from a given file path
 */
function getFilenameFromPath(filePath: string): string {
  const lastSeparatorIndex = filePath.lastIndexOf("/");
  const filename =
    lastSeparatorIndex === -1
      ? filePath
      : filePath.slice(lastSeparatorIndex + 1);
  return filename;
}

type LinkToSourceRegionProps = {
  targetAddr: string;
  targetStart?: number;
  targetEnd?: number;
  targetSource?: string;
  targetSourceHash?: string;
  contractName?: string;
} & PropsWithChildren;

const LinkToSourceRegion: FC<LinkToSourceRegionProps> = ({
  targetAddr,
  targetStart,
  targetEnd,
  targetSource,
  targetSourceHash,
  contractName,
  children,
}) => {
  const [safeUrl, setSafeUrl] = useState<string>();
  const [lineNumber, setLineNumber] = useState<number | null>(null);
  const { sourcifySource } = useAppConfigContext();
  const sourcifySources = useSourcifySources();
  const { provider } = useContext(RuntimeContext);
  const match = useSourcifyMetadata(targetAddr, provider._network.chainId);

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

  useEffect(() => {
    if (
      targetAddr &&
      targetStart &&
      targetEnd &&
      targetSource &&
      targetSourceHash &&
      match
    ) {
      // Find the line number of the starting location
      (async function fetchContract() {
        const contractData = await queryClient.fetchQuery(
          getContractQuery(
            sourcifySources,
            sourcifySource,
            targetAddr,
            provider._network.chainId,
            targetSource,
            targetSourceHash,
            match.type,
          ),
        );

        if (contractData !== null) {
          const newLineNumber = getLineNumber(contractData, targetStart);
          if (newLineNumber !== null) {
            setLineNumber(newLineNumber);
          }
        }
      })();
    }
  }, [
    targetAddr,
    targetStart,
    targetEnd,
    targetSource,
    targetSourceHash,
    match,
  ]);

  if (!safeUrl) {
    return null;
  }

  return (
    <NavLink className="text-link-blue hover:text-link-blue-hover" to={safeUrl}>
      {contractName ? (
        <div
          className={`flex space-x-1 ${targetStart !== undefined && targetEnd !== undefined ? "text-green-600 hover:text-green-800" : "text-verified-contract hover:text-verified-contract-hover"}`}
        >
          <SourcifyLogo />
          <span>
            {contractName}
            {lineNumber !== null && targetSource
              ? " - " + getFilenameFromPath(targetSource) + ":" + lineNumber
              : null}
          </span>
        </div>
      ) : (
        targetAddr
      )}
    </NavLink>
  );
};

export default LinkToSourceRegion;
