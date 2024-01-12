import { ParamType } from "ethers";
import { FC, type ReactNode } from "react";

type ParamDeclarationProps = {
  input: ParamType;
  index: number;
  short?: boolean;
};

function insertCommaEveryOther(components: ReactNode[]): ReactNode[] {
  const result = [];
  for (let i = 0; i < components.length; i++) {
    if (i > 0) {
      result.push(", ");
    }
    result.push(components[i]);
  }
  return result;
}

function getParamType(
  paramType: ParamType,
  short: boolean = false,
): ReactNode[] {
  if (paramType.isArray()) {
    const end =
      paramType.arrayLength === -1 ? "[]" : "[" + paramType.arrayLength + "]";
    return [...getParamType(paramType.arrayChildren!), end];
  } else if (paramType.isTuple()) {
    if (short) {
      return ["tuple(...)"];
    }
    return [
      "(",
      ...insertCommaEveryOther(
        paramType.components!.map((component: ParamType, index: number) => (
          <ParamDeclaration input={component} index={index} short={short} />
        )),
      ),
      ")",
    ];
  } else {
    return [paramType.type];
  }
}

const ParamDeclaration: FC<ParamDeclarationProps> = ({
  input,
  index,
  short,
}) => {
  return (
    <span className="font-code text-sm font-medium text-blue-700">
      <span className="text-red-700">{getParamType(input, short)}</span>{" "}
      {input.name !== "" ? (
        input.name
      ) : (
        <span className="italic text-blue-400">param_{index}</span>
      )}
    </span>
  );
};

export default ParamDeclaration;
