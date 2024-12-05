import { useQuery } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import { queryClient } from "../../../queryClient";
import {
  bytecodeToInstructionIndex,
  getSourceRange,
} from "../../../sourcify/sourceMapping";
import SourcifyLogo from "../../../sourcify/SourcifyLogo";
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

const RevertTrace: React.FC<RevertTraceProps> = ({ txHash }) => {
  const { provider } = useContext(RuntimeContext);
  const { sourcifySource } = useAppConfigContext();
  const { sources: sourcifySources } = useSourcifySources();
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
    | {
        address: string;
        targetStart?: number;
        targetEnd?: number;
        targetSource?: string;
        contractName?: string;
      }[]
    | null
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
          let contractName: string | undefined = undefined;

          const targetMatch = await queryClient.fetchQuery(
            getSourcifyMetadataQuery(
              sourcifySources,
              sourcifySource,
              targetAddr,
              provider._network.chainId,
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
            // TODO: SourcifyV2 only
            (targetMatch.metadata as any).output.contracts !== undefined
          ) {
            // TODO: metadata only (as before)
            const fileName = Object.keys(
              targetMatch.metadata.settings.compilationTarget,
            )[0];
            const sourceName =
              targetMatch.metadata.settings.compilationTarget[fileName];
            // TODO: This is not part of the metadata object! SourcifyV2 only.
            const sourceMap = (targetMatch.metadata as any).output.contracts[
              fileName
            ][sourceName].evm.deployedBytecode.sourceMap;
            const soliditySources = Object.values(
              (targetMatch.metadata as any).output.sources,
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
                  (targetMatch.metadata as any).output.sources,
                ).find(
                  (key) =>
                    (targetMatch.metadata as any).output.sources[key].id ===
                    sourceIndex,
                );
                break;
              }
            }
          }
          return {
            targetStart,
            targetEnd,
            targetSource,
            contractName,
            address: targetAddr,
          };
        }),
      );
      setRevertLocations(newRevertLocations);
    })();
  }, [txHash, revertChain.length]);

  let revertLocationsFinal:
    | {
        address: string;
        targetStart?: number;
        targetEnd?: number;
        targetSource?: string;
        contractName?: string;
      }[]
    | null =
    revertLocations !== null &&
    revertLocations.length === 0 &&
    revertChain.length > 0
      ? revertChain.map((traceGroup) => ({ address: traceGroup.to }))
      : revertLocations;

  return traceRes && revertLocationsFinal !== null ? (
    revertLocationsFinal.length > 0 ? (
      revertLocationsFinal.map(
        (
          { targetStart, targetEnd, targetSource, contractName, address },
          index,
        ) => (
          <div className="flex" key={index}>
            <LinkToSourceRegion
              targetAddr={address}
              targetStart={targetStart}
              targetEnd={targetEnd}
              targetSource={targetSource}
            >
              {contractName ? (
                <div
                  className={`flex space-x-1 ${targetStart !== undefined && targetEnd !== undefined ? "text-green-600 hover:text-green-800" : "text-verified-contract hover:text-verified-contract-hover"}`}
                >
                  <SourcifyLogo />
                  <span>{contractName}</span>
                </div>
              ) : (
                address
              )}
            </LinkToSourceRegion>
            {index < revertLocationsFinal.length - 1 ? <>/</> : null}
          </div>
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
