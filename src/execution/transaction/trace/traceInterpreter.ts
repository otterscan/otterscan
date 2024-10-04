import { type TraceGroup } from "../../../useErigonHooks";

export interface VM {
  ops: Array<{ pc: number; sub?: VM | null; op: string }>;
  code: string;
}

export type VmStepGroup = {
  code: string;
  endsInRevert: boolean;
  pc: number[];
  children: VmStepGroup[] | null;
};

export type TraceGroupWithSteps = TraceGroup & {
  code: string;
  endsInRevert: boolean;
  pc: number[];
  children: TraceGroupWithSteps[] | null;
};

// TODO: Also handle out-of-gas situations by checking gas left
export function findTraceExitLocations(vm: VM): VmStepGroup {
  let pc: number[] = [];
  let children: VmStepGroup[] = [];
  let endsInRevert: boolean = false;

  if (vm.ops.length > 0) {
    // Create the top-level object
    pc = vm.ops.map((op) => op.pc);

    // Iterate over ops and handle any "sub" recursively
    for (const item of vm.ops) {
      if ("sub" in item && item.sub) {
        children.push(findTraceExitLocations(item.sub));
      }
    }

    if (vm.ops[vm.ops.length - 1].op === "REVERT") {
      endsInRevert = true;
    }
  }

  return {
    pc,
    children: children.length > 0 ? children : null,
    code: vm.code,
    endsInRevert,
  };
}

/**
 * Finds the chain of last-child TraceGroupWithSteps which end in a revert.
 *
 * @param stepGroups - Array of TraceGroupWithSteps, or null
 * @returns - Chain (flat array) of TraceGroupWithSteps that end in a reverted call
 */
export function findRevertChain(
  stepGroups: TraceGroupWithSteps[] | null,
): TraceGroupWithSteps[] {
  let chain: TraceGroupWithSteps[] = [];
  let node: TraceGroupWithSteps[] | null = stepGroups;
  while (node !== null && node.length > 0) {
    if (node[node.length - 1].endsInRevert) {
      chain.push(node[node.length - 1]);
      node = node[node.length - 1].children;
    } else {
      node = null;
    }
  }
  return chain;
}

export function addPcList(
  trace: TraceGroup,
  vmexit: VmStepGroup,
): TraceGroupWithSteps {
  const mergedChildren =
    trace.children && vmexit.children
      ? mergeEntries(trace.children as TraceGroup[], vmexit.children)
      : null;

  return {
    ...trace,
    pc: vmexit.pc || undefined,
    code: vmexit.code,
    children: mergedChildren,
    endsInRevert: vmexit.endsInRevert,
  };
}

const callTraceTypes = [
  "CALL",
  "STATICCALL",
  "DELEGATECALL",
  "CREATE",
  "CREATE2",
];

export function mergeEntries(
  traces: TraceGroup[],
  vms: VmStepGroup[],
): TraceGroupWithSteps[] | null {
  traces = traces.filter((trace) => callTraceTypes.includes(trace.type));
  if (traces.length === 0 || traces.length !== vms.length) {
    return null;
  }

  return traces.map((trace, index) => addPcList(trace, vms[index]));
}

/**
 * EVM bytecode blocks which are commonly deduplicated by the Solidity compiler's optimizer.
 */
export const commonDeduplicatedBlocks: number[][] = [
  [
    // JUMPDEST
    0x5b,
    // PUSH 40
    0x60, 0x40,
    // MLOAD
    0x51,
    // DUP1
    0x80,
    // SWAP2
    0x91,
    // SUB
    0x03,
    // SWAP1
    0x90,
    // REVERT
    0xfd,
  ],
];

/**
 * Finds the first unique location from the end of the offsets list after
 * skipping a common deduplicated block should one exist.
 * Currently, this function assumes the entire block must be executed if its
 * last instruction is executed (no jumps).
 *
 * @param pc - A list of program counter byte offsets passed during transaction
 * execution
 * @param code - The EVM contract (runtime) bytecode as a Uint8Array
 * @param startIndex - The index in the pc array to start at
 * @returns The index of the last PC location in the offsets list that is not
 * part of a commonly deduplicated block
 */
export function findLastUniqueLocation(
  pc: number[],
  code: Uint8Array,
  startIndex?: number,
): number {
  const startIndexNum = startIndex ?? pc.length - 1;
  if (pc.length == 0 || startIndexNum < 0 || startIndexNum > pc.length) {
    return -1;
  }

  let lastOffsetIndex = startIndexNum;
  let lastOffset = pc[lastOffsetIndex];

  // Compare each block to see if a block matches the end of code[:offset]
  for (const block of commonDeduplicatedBlocks) {
    const blockLength = block.length;
    if (
      lastOffset >= blockLength &&
      code
        .slice(lastOffset - blockLength + 1, lastOffset + 1)
        .every((value, index) => value === block[index])
    ) {
      // Block matches. Skip it and find the new last unique location
      // Note: the following line makes the assumption that the last opcode has
      // an instruction length of 1
      const blockStart = lastOffset - blockLength + 1;
      const blockEnd = blockStart + blockLength;
      while (
        lastOffsetIndex >= 0 &&
        pc[lastOffsetIndex] >= blockStart &&
        pc[lastOffsetIndex] < blockEnd
      ) {
        lastOffsetIndex--;
      }
      lastOffset = pc[lastOffsetIndex];
    }
  }

  return lastOffsetIndex;
}
