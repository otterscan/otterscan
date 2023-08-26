import { FC, memo, useContext, useState, FormEvent } from "react";
import { SyntaxHighlighter, docco } from "../../../highlight-init";
import { FunctionFragment, Result, Interface, type ParamType } from "ethers";
import { RuntimeContext } from "../../../useRuntime";
import { parse } from "./contractInputDataParser";
import DecodedParamsTable from "../../transaction/decoder/DecodedParamsTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

interface ReadFunctionProps {
  address: string;
  func: FunctionFragment;
}

function validateArgument(arg: any, argType: ParamType) {
  // Check only those types which ethers might parse incorrectly
  if (argType.baseType === "string" && typeof arg !== "string") {
    throw new Error(`Invalid string "${arg}": got type ${typeof arg}`);
  } else if (argType.baseType === "bool" && typeof arg !== "boolean") {
    throw new Error(`Invalid bool "${arg}": got type ${typeof arg}`);
  } else if (argType.baseType === "array") {
    if (!Array.isArray(arg)) {
      throw new Error(`Invalid array "${arg}": got type ${typeof arg}`);
    }
    arg.map((childArg) => validateArgument(childArg, argType.arrayChildren!));
  } else if (argType.baseType === "tuple") {
    if (!Array.isArray(arg)) {
      throw new Error(`Invalid tuple "${arg}": got type ${typeof arg}`);
    }
    if (arg.length !== argType.components!.length) {
      throw new Error(
        `Expected tuple length ${argType.components!.length}, got ${
          arg.length
        }: [${arg}]`
      );
    }
    arg.map((childArg, i) =>
      validateArgument(childArg, argType.components![i])
    );
  }
}

function parseArgument(
  arg: string,
  argType: ParamType,
  argIndex: number
): string | bigint | boolean | any[] {
  let finalArg = arg;
  // Add quotes around input for strings
  if (arg.length === 0) {
    throw new Error(`Argument ${argIndex} missing`);
  }
  if (argType.baseType === "string" && arg.length > 0 && arg[0] !== '"') {
    finalArg = `"${finalArg}"`;
  }
  const parsed = parse(finalArg);
  if (parsed.ast) {
    validateArgument(parsed.ast.value, argType);
    return parsed.ast.value;
  } else {
    throw new Error(
      parsed.errs
        .map(
          (err) =>
            `${err.toString()}\n${finalArg}\n${"-".repeat(err.pos.overallPos)}^`
        )
        .join("\n")
    );
  }
}

const ReadFunction: FC<ReadFunctionProps> = ({ address, func }) => {
  let [result, setResult] = useState<Result | null | undefined>(null);
  let [error, setError] = useState<string | null>(null);
  let [inputs, setInputs] = useState<string[]>(
    new Array(func.inputs.length).fill("")
  );
  const { provider } = useContext(RuntimeContext);

  async function submitCall() {
    let int = new Interface([func]);
    if (provider) {
      try {
        // The parser can be recompiled with `npm run recompile-parsers`
        let encodedData = int.encodeFunctionData(
          func.name,
          inputs.map((input: string, i: number) =>
            parseArgument(input, func.inputs[i], i)
          )
        );
        setResult(undefined);
        let resultData = await provider.call({
          to: address,
          data: encodedData,
        });
        setResult(int.decodeFunctionResult(func.name, resultData));
        setError(null);
      } catch (e: any) {
        setResult(null);
        setError(e.toString());
      }
    } else {
      setResult(null);
      setError("Provider not found");
    }
  }

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    submitCall();
  }

  return (
    <li key={func.format()} className="pb-4">
      <span className="text-md font-medium">{func.name}</span>
      <form onSubmit={onFormSubmit} className="mt-2 pl-4">
        {func.inputs && (
          <ul className="list-inside">
            {func.inputs.map((input: any, index: number) => (
              <li className="pl-2" key={index}>
                <span className="text-sm font-medium text-gray-600">
                  {input.format("full")}
                </span>
                <input
                  type="text"
                  className="mt-1 w-full rounded border px-2 py-1 text-sm text-gray-600"
                  placeholder={input.format("full")}
                  onChange={(event) => {
                    let newInputs = [...inputs];
                    newInputs[index] = event.target.value;
                    setInputs(newInputs);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        <button
          className="ml-2 mt-1 rounded border bg-skin-button-fill px-3 py-1 text-left text-sm text-skin-button hover:bg-skin-button-hover-fill focus:outline-none"
          type="submit"
        >
          Query
        </button>{" "}
        {result === undefined && (
          <span className="self-center">
            <FontAwesomeIcon className="animate-spin" icon={faCircleNotch} />
          </span>
        )}
      </form>
      <div className="mt-2 pl-6">
        {result && (
          <DecodedParamsTable args={result} paramTypes={func.outputs || []} />
        )}
        {error && (
          <p className="whitespace-break-spaces font-mono text-red-500">
            {error}
          </p>
        )}
      </div>
    </li>
  );
};

export default memo(ReadFunction);
