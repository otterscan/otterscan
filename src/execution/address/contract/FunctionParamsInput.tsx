import { type ParamType } from "ethers";
import { FC, memo, useState } from "react";
import ParamDeclaration from "../../components/ParamDeclaration";
import { prepareArgument } from "./ReadFunction";

interface FunctionParamsInputProps {
  params: readonly ParamType[];
  inputCallback: (values: string[]) => void;
}

const FunctionParamsInput: FC<FunctionParamsInputProps> = ({
  params,
  inputCallback,
}) => {
  let [inputs, setInputs] = useState<string[]>(
    new Array(params.length).fill(""),
  );

  function updateInput(index: number, value: string) {
    let newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    inputCallback(newInputs);
  }

  return (
    <ul className="list-inside">
      {params.map((param: ParamType, index: number) => (
        <li className="pl-2" key={index}>
          <span className="text-sm font-medium text-gray-600">
            <ParamDeclaration input={param} index={index} />
          </span>
          {param.baseType === "tuple" ? (
            <ul className="ml-2 list-inside">
              <FunctionParamsInput
                params={param.components!}
                inputCallback={(values: string[]) => {
                  const preparedValues = values.map(
                    (value: string, valueIndex: number) =>
                      prepareArgument(value, param.components![valueIndex]),
                  );
                  updateInput(index, "[" + preparedValues.join(",") + "]");
                }}
              />
            </ul>
          ) : (
            <input
              type="text"
              className="mt-1 w-full rounded border px-2 py-1 text-sm text-gray-600"
              placeholder={param.format("full")}
              onChange={(event) => {
                updateInput(index, event.target.value);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default memo(FunctionParamsInput);
