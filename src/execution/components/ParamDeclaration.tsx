import { FC } from "react";
import { ParamType } from "ethers";

type ParamDeclarationProps = {
  input: ParamType;
  index: number;
};

const ParamDeclaration: FC<ParamDeclarationProps> = ({ input, index }) => {
  if (input.isArray() || input.isTuple()) {
    return (
      <span className="text-sm font-medium text-gray-600">
        {input.format("full")}
      </span>
    );
  }

  return (
    <span className="font-code text-sm font-medium text-blue-700">
      <span className="text-red-700">{input.type}</span>{" "}
      {input.name !== "" ? (
        input.name
      ) : (
        <span className="italic text-blue-400">param_{index}</span>
      )}
    </span>
  );
};

export default ParamDeclaration;
