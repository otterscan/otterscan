import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FunctionFragment,
  Interface,
  JsonRpcApiProvider,
  Result,
  resolveAddress,
  type ParamType,
} from "ethers";
import { FC, FormEvent, memo, useContext, useState } from "react";
import { RuntimeContext } from "../../../useRuntime";
import DecodedParamsTable from "../../transaction/decoder/DecodedParamsTable";
import FunctionParamsInput from "./FunctionParamsInput";
import { parse } from "./contractInputDataParser";

interface ReadFunctionProps {
  address: string;
  func: FunctionFragment;
}

/**
 * Prepares an unprocessed argument string by coercing it into the proper
 * format in some cases as a convenience feature
 */
export function prepareArgument(arg: string, argType: ParamType) {
  // Add quotes around input for strings and ENS domains
  let finalArg = arg;
  if (
    (argType.baseType === "string" ||
      (argType.baseType === "address" && arg.endsWith(".eth"))) &&
    arg[0] !== '"'
  ) {
    finalArg = `"${finalArg}"`;
  }
  return finalArg;
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
  if (arg.length === 0) {
    throw new Error(`Argument ${argIndex} missing`);
  }
  let finalArg = prepareArgument(arg, argType);
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
          <FunctionParamsInput
            params={func.inputs}
            inputCallback={(values: string[]) => setInputs(values)}
          />
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
