import { ParamType } from "ethers";
import { FC } from "react";

type ParamDeclarationProps = {
  input: ParamType;
  index: number;
};

function getShortenedParamType(paramType: ParamType): string {
  if (paramType.isArray()) {
    const end =
      paramType.arrayLength === -1 ? "[]" : "[" + paramType.arrayLength + "]";
    return getShortenedParamType(paramType.arrayChildren!) + end;
  } else if (paramType.isTuple()) {
    return "tuple(...)";
  } else {
    return paramType.type;
  }
}

const ParamDeclaration: FC<ParamDeclarationProps> = ({ input, index }) => {
  return (
    <span className="font-code text-sm font-medium text-blue-700">
      <span className="text-red-700">{getShortenedParamType(input)}</span>{" "}
      {input.name !== "" ? (
        input.name
      ) : (
        <span className="italic text-blue-400">param_{index}</span>
      )}
    </span>
  );
};

export default ParamDeclaration;
