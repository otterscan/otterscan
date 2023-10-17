import { FC, memo, useContext, useState, FormEvent } from "react";
import {
  JsonRpcApiProvider,
  FunctionFragment,
  Result,
  Interface,
  type ParamType,
  resolveAddress,
} from "ethers";
import ParamDeclaration from "../../components/ParamDeclaration";
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
  if (
    (argType.baseType === "string" || argType.baseType === "address") &&
    typeof arg !== "string"
  ) {
    throw new Error(
      `Invalid ${argType.baseType} "${arg}": got type ${typeof arg}`,
    );
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
        }: [${arg}]`,
      );
    }
    arg.map((childArg, i) =>
      validateArgument(childArg, argType.components![i]),
    );
  }
}

async function transformArgument(
  arg: any,
  argType: ParamType,
  provider: JsonRpcApiProvider,
): Promise<any> {
  if (argType.baseType === "address" && (arg as string).endsWith(".eth")) {
    // Resolve ENS domain
    return resolveAddress(arg, provider);
  } else if (argType.baseType === "array") {
    return Promise.all(
      (arg as any[]).map((childArg) =>
        transformArgument(childArg, argType.arrayChildren!, provider),
      ),
    );
  } else if (argType.baseType === "tuple") {
    return Promise.all(
      (arg as any[]).map((childArg, i) =>
        transformArgument(childArg, argType.components![i], provider),
      ),
    );
  }
  return arg;
}

async function parseArgument(
  arg: string,
  argType: ParamType,
  argIndex: number,
  provider: JsonRpcApiProvider,
): Promise<string | bigint | boolean | any[]> {
  let finalArg = arg;
  if (arg.length === 0) {
    throw new Error(`Argument ${argIndex} missing`);
  }
  // Add quotes around input for strings and ENS domains, out of convenience
  if (
    (argType.baseType === "string" ||
      (argType.baseType === "address" && arg.endsWith(".eth"))) &&
    arg[0] !== '"'
  ) {
    finalArg = `"${finalArg}"`;
  }
  const parsed = parse(finalArg);
  if (parsed.ast) {
    validateArgument(parsed.ast.value, argType);
    const transformedArg = await transformArgument(
      parsed.ast.value,
      argType,
      provider,
    );
    return transformedArg;
  } else {
    throw new Error(
      parsed.errs
        .map(
          (err) =>
            `${err.toString()}\n${finalArg}\n${"-".repeat(
              err.pos.overallPos,
            )}^`,
        )
        .join("\n"),
    );
  }
}

const ReadFunction: FC<ReadFunctionProps> = ({ address, func }) => {
  let [result, setResult] = useState<Result | null | undefined>(null);
  let [error, setError] = useState<string | null>(null);
  let [inputs, setInputs] = useState<string[]>(
    new Array(func.inputs.length).fill(""),
  );
  const { provider } = useContext(RuntimeContext);

  async function submitCall() {
    let int = new Interface([func]);
    if (provider) {
      try {
        setResult(undefined);
        // The parser can be recompiled with `npm run build-parsers`
        let encodedData = int.encodeFunctionData(
          func.name,
          await Promise.all(
            inputs.map((input: string, i: number) =>
              parseArgument(input, func.inputs[i], i, provider),
            ),
          ),
        );
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
          <ol className="list-inside">
            {func.inputs.map((input, index) => (
              <li className="pl-2" key={index}>
                <ParamDeclaration input={input} index={index} />
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
          </ol>
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
          <DecodedParamsTable
            args={result}
            paramTypes={func.outputs || []}
            defaultNameBase="ret"
          />
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
