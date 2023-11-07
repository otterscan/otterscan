import { ParamType } from "ethers";
import { FC } from "react";

type ParamDeclarationProps = {
  input: ParamType;
  index: number;
};

const ParamDeclaration: FC<ParamDeclarationProps> = ({ input, index }) => {
  let paramTypeName = input.type;
  if (input.isArray()) {
    return (
      <span className="text-sm font-medium text-gray-600">
        {input.format("full")}
      </span>
    );
  } else if (input.isTuple()) {
    paramTypeName = "tuple(...)";
  }

  return (
    <span className="font-code text-sm font-medium text-blue-700">
      <span className="text-red-700">{paramTypeName}</span>{" "}
      {input.name !== "" ? (
        input.name
      ) : (
        <span className="italic text-blue-400">param_{index}</span>
      )}
    </span>
  );
};

export default ParamDeclaration;
