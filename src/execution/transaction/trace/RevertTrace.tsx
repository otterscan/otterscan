import { useQuery } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import { queryClient } from "../../../queryClient";
import {
  bytecodeToInstructionIndex,
  getSourceRange,
} from "../../../sourcify/sourceMapping";
import {
  getSourcifyMetadataQuery,
  useSourcifySources,
} from "../../../sourcify/useSourcify";
import { useAppConfigContext } from "../../../useAppConfig";
import {
  getTraceTransactionQuery,
  getVmTraceQuery,
} from "../../../useErigonHooks";
import { RuntimeContext } from "../../../useRuntime";
import { hexToArray } from "../../../utils/utils";
import LinkToSourceRegion from "./LinkToSourceRegion";
import {
  findLastUniqueLocation,
  findRevertChain,
  findTraceExitLocations,
  mergeEntries,
} from "./traceInterpreter";

interface RevertTraceProps {
  txHash: string;
}

interface RevertLocation {
  address: string;
  targetStart?: number;
  targetEnd?: number;
  targetSource?: string;
  targetSourceHash?: string;
  contractName?: string;
}

const RevertTrace: React.FC<RevertTraceProps> = ({ txHash }) => {
  const { provider } = useContext(RuntimeContext);
  const { sourcifySource } = useAppConfigContext();
  const sourcifySources = useSourcifySources();
  const { data: otsTrace } = useQuery(
    getTraceTransactionQuery(provider, txHash),
  );
  const { data: vmTrace } = useQuery(getVmTraceQuery(provider, txHash));
  const traceRes =
    otsTrace &&
    vmTrace &&
    mergeEntries(otsTrace, [findTraceExitLocations(vmTrace)]);
  const revertChain = findRevertChain(traceRes ?? null);

  const [revertLocations, setRevertLocations] = useState<
    RevertLocation[] | null
  >(
    revertChain
      ? revertChain.map((traceGroup) => ({ address: traceGroup.to }))
      : null,
  );

  useEffect(() => {
    (async () => {
      const newRevertLocations = await Promise.all(
        revertChain.map(async (revertingCall) => {
          const targetAddr = revertingCall.to;
          const targetOffsets = revertingCall.pc;
          const targetCode = revertingCall.code;

          let targetStart: number | undefined = undefined;
          let targetEnd: number | undefined = undefined;
          let targetSource: string | undefined = undefined;
          let targetSourceHash: string | undefined = undefined;
          let contractName: string | undefined = undefined;

          const targetMatch = await queryClient.fetchQuery(
            getSourcifyMetadataQuery(
              sourcifySources,
              sourcifySource,
              targetAddr,
              provider._network.chainId,
              true,
            ),
          );

          if (
            targetMatch &&
            targetMatch.metadata?.settings?.compilationTarget
          ) {
            const fileName = Object.keys(
              targetMatch.metadata.settings.compilationTarget,
            )[0];
            const sourceName =
              targetMatch.metadata.settings.compilationTarget[fileName];
            contractName = sourceName;
          }

          if (
            targetMatch &&
            targetMatch.metadata.settings !== undefined &&
            targetOffsets !== undefined &&
            targetCode !== undefined &&
            targetMatch.runtimeBytecode?.sourceMap !== undefined &&
            // TODO: Remove once SourcifyV2 support for the sources key is implemented
            targetMatch.stdJsonOutput?.sources !== undefined
          ) {
            // TODO: metadata only (as before)
            const fileName = Object.keys(
              targetMatch.metadata.settings.compilationTarget,
            )[0];
            const sourceName =
              targetMatch.metadata.settings.compilationTarget[fileName];
            const sourceMap = targetMatch.runtimeBytecode.sourceMap;
            const soliditySources = Object.values(
              targetMatch.stdJsonOutput.sources,
            ).map((source: any) => source.id);
            const instructionIndexMap = bytecodeToInstructionIndex(targetCode);

            const lastUniqueIndex = findLastUniqueLocation(
              targetOffsets,
              hexToArray(
                targetCode.startsWith("0x") ? targetCode : "0x" + targetCode,
              ),
            );
            for (let i = lastUniqueIndex; i >= 0; i--) {
              const instructionNumber = instructionIndexMap[targetOffsets[i]];
              const sourceRange = getSourceRange(sourceMap, instructionNumber);
              if (sourceRange === null) {
                continue;
              }
              const { byteOffset, length, sourceIndex } = sourceRange;
              if (soliditySources.includes(sourceIndex)) {
                targetStart = byteOffset;
                targetEnd = byteOffset + length;
                targetSource = Object.keys(
                  targetMatch.stdJsonOutput.sources,
                ).find(
                  (key) =>
                    targetMatch.stdJsonOutput?.sources?.[key]?.id ===
                    sourceIndex,
                );
                if (
                  targetSource !== undefined &&
                  targetSource in targetMatch.metadata.sources
                ) {
                  targetSourceHash =
                    targetMatch.metadata.sources[targetSource].keccak256;
                }
                break;
              }
            }
          }
          return {
            targetStart,
            targetEnd,
            targetSource,
            targetSourceHash,
            contractName,
            address: targetAddr,
          };
        }),
      );
      setRevertLocations(newRevertLocations);
    })();
  }, [txHash, revertChain.length, sourcifySource]);

  let revertLocationsFinal: RevertLocation[] | null =
    revertLocations !== null &&
    revertLocations.length === 0 &&
    revertChain.length > 0
      ? revertChain.map((traceGroup) => ({ address: traceGroup.to }))
      : revertLocations;

  return traceRes && revertLocationsFinal !== null ? (
    revertLocationsFinal.length > 0 ? (
      revertLocationsFinal.map(
        (
          {
            targetStart,
            targetEnd,
            targetSource,
            targetSourceHash,
            contractName,
            address,
          },
          index,
        ) => (
          <>
            <div className="flex" key={index}>
              <LinkToSourceRegion
                targetAddr={address}
                targetStart={targetStart}
                targetEnd={targetEnd}
                targetSource={targetSource}
                targetSourceHash={targetSourceHash}
                contractName={contractName}
              ></LinkToSourceRegion>
            </div>
            {index < revertLocationsFinal.length - 1 && (
              <div className="w-full flex justify-center">
                {/* Chevron */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-4 -1.5 8 2.5"
                  fill="#88b"
                  className="w-[20px] h-2"
                >
                  <path d="M0 -1L4 1V0.5L0 -1.5L-4 0.5V1Z"></path>
                </svg>
              </div>
            )}
          </>
        ),
      )
    ) : (
      <p>No revert locations found.</p>
    )
  ) : (
    <p>Loading...</p>
  );
};

export default RevertTrace;
