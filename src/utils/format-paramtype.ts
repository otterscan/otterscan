import { NamedFragment, ParamType } from "ethers";

export function formatParamsShort(params: readonly ParamType[]): string {
  return (
    "(" +
    params
      .map(
        (param) =>
          // ethers bug gives some tuples a type of "tuple(uint256,bytes,...)"
          (param.type.startsWith("tuple") ? "tuple" : param.type) +
          (param.name !== "" ? ` ${param.name}` : ""),
      )
      .join(", ") +
    ")"
  );
}

export function formatFragmentShort(frag: NamedFragment): string {
  return frag.name + formatParamsShort(frag.inputs);
}
