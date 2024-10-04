import { BytecodeIter } from "@shazow/whatsabi";

export function getSourceRange(
  sourceMapping: string,
  instructionIndex: number,
): { byteOffset: number; length: number; sourceIndex: number } | null {
  const elements = sourceMapping.split(";");

  if (instructionIndex >= elements.length) {
    // Out of bounds for this contract
    return null;
  }

  // Populate backward; empty fields and missing elements correspond to the peceding element
  let targetMapping: (number | undefined)[] = [undefined, undefined, undefined];
  for (let i = instructionIndex; i >= 0; i--) {
    const instruction = elements[i];
    if (instruction.length === 0) {
      // Same as previous
      continue;
    }

    // Find non-empty fields and add them
    const items = instruction.split(":");
    for (
      let itemIndex = 0;
      itemIndex < items.length && itemIndex < 3;
      itemIndex++
    ) {
      if (
        items[itemIndex].length > 0 &&
        targetMapping[itemIndex] === undefined
      ) {
        targetMapping[itemIndex] = Number(items[itemIndex]);
        if (targetMapping.every((x) => x !== undefined)) {
          // All fields have been filled
          return {
            byteOffset: targetMapping[0],
            length: targetMapping[1],
            sourceIndex: targetMapping[2],
          };
        }
      }
    }
  }

  return null;
}

export function bytecodeToInstructionIndex(bytecode: string): number[] {
  const code = new BytecodeIter(bytecode, { bufferSize: 5 });
  const codeSize = Math.floor(bytecode.length / 2);
  const arr: number[] = new Array(codeSize).fill(0);

  let lastPos = 0;

  while (true) {
    code.next();
    const pos = code.pos();
    const step = code.step();

    // Fill the location of the previous instruction
    for (let i = lastPos; i < pos; i++) {
      arr[i] = step - 1;
    }

    lastPos = pos;
    if (!code.hasMore()) {
      code.next();
      for (let i = lastPos; i < codeSize; i++) {
        arr[i] = code.step();
      }
      break;
    }
  }

  return arr;
}
