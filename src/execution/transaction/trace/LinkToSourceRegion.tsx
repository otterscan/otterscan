import { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { NavLink } from "react-router";
import { queryClient } from "../../../queryClient";
import SourcifyLogo from "../../../sourcify/SourcifyLogo";
import {
  getContractQuery,
  resolveSourcifySource,
  transformContractResponse,
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
  const [lineNumbers, setLineNumbers] = useState<number[] | null>(null);
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

    if (lineNumbers !== null && lineNumbers.length === 2) {
      searchParams.append("hl", `${lineNumbers[0]}-${lineNumbers[1]}`);
    }

    const url = `/address/${encodeURIComponent(targetAddr)}/contract?${searchParams.toString()}`;
    setSafeUrl(url);
  }, [targetAddr, targetStart, targetEnd, targetSource, lineNumbers]);

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
        // `fetchQuery` does not support the `select` option, so we must call
        // the `transformContractResponse` to "select" the target data manually
        const contractData: string = await queryClient
          .fetchQuery(
            getContractQuery(
              sourcifySources,
              sourcifySource,
              targetAddr,
              provider._network.chainId,
              targetSource,
              targetSourceHash,
              match.type,
            ),
          )
          .then((data) =>
            transformContractResponse(
              data,
              targetSource,
              resolveSourcifySource(sourcifySource, sourcifySources)
                .sourcifySource,
            ),
          );

        if (contractData !== null) {
          const newLineNumbers = [];
          const newStartLine = getLineNumber(contractData, targetStart);
          if (newStartLine !== null) {
            newLineNumbers.push(newStartLine);
          }
          const newEndLine = getLineNumber(contractData, targetEnd);
          if (newEndLine !== null) {
            newLineNumbers.push(newEndLine);
          }

          if (newLineNumbers.length > 0) {
            setLineNumbers(newLineNumbers);
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
            {lineNumbers !== null && lineNumbers.length > 0 && targetSource
              ? " - " + getFilenameFromPath(targetSource) + ":" + lineNumbers[0]
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
