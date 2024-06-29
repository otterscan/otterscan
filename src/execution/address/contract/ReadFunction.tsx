import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FunctionFragment,
  Interface,
  JsonRpcApiProvider,
  Result,
  parseUnits,
  resolveAddress,
  type ParamType,
} from "ethers";
import { FC, FormEvent, memo, useContext, useRef, useState } from "react";
import Accordion from "../../../components/Accordion";
import { DevMethod } from "../../../sourcify/useSourcify";
import { useChainInfo } from "../../../useChainInfo";
import { RuntimeContext } from "../../../useRuntime";
import ParamDeclaration from "../../components/ParamDeclaration";
import OutputDecoder from "../../transaction/decoder/OutputDecoder";
import FunctionParamInput, {
  ParamComponentRef,
  ParamValue,
} from "./FunctionParamInput";
import { parse } from "./contractInputDataParser";

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

async function parseStructuredArgument(
  arg: ParamValue,
  argType: ParamType,
  argIndex: number,
  provider: JsonRpcApiProvider,
): Promise<string | bigint | boolean | any[]> {
  const isSingleType = typeof arg === "string";
  if (
    isSingleType ===
    (argType.baseType === "tuple" || argType.baseType === "array")
  ) {
    throw new Error(`ParamValue type mismatch`);
  }
  if (isSingleType) {
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
  } else {
    if (argType.baseType === "tuple") {
      return Promise.all(
        arg.map((childArg: ParamValue, index: number) =>
          parseStructuredArgument(
            childArg,
            argType.components![index],
            argIndex,
            provider,
          ),
        ),
      );
    } else if (argType.baseType === "array") {
      return Promise.all(
        arg.map((childArg: ParamValue) =>
          parseStructuredArgument(
            childArg,
            argType.arrayChildren!,
            argIndex,
            provider,
          ),
        ),
      );
    }
  }

  throw new Error("Unhandled parse sequence: " + argType.format("full"));
}

interface ReadFunctionProps {
  address: string;
  func: FunctionFragment;
  devMethod?: DevMethod;
  showDecodedOutputs?: boolean;
}

const ReadFunction: FC<ReadFunctionProps> = ({
  address,
  func,
  devMethod,
  showDecodedOutputs = true,
}) => {
  let [result, setResult] = useState<
    { result: Result; data: string } | null | undefined
  >(null);
  let [error, setError] = useState<string | null>(null);
  let [blockNumber, setBlockNumber] = useState<string>("latest");
  let [sender, setSender] = useState<string>("");
  let [value, setValue] = useState<string>("");
  const childRefs = useRef<ParamComponentRef[]>(
    new Array(func.inputs.length).fill(null),
  );
  const { provider } = useContext(RuntimeContext);
  const { nativeCurrency } = useChainInfo();

  async function submitCall() {
    let int = new Interface([func]);
    let blockTag = blockNumber || "latest";
    if (/^\d+$/.test(blockNumber)) {
      const num = BigInt(blockNumber);
      blockTag = "0x" + num.toString(16);
    }
    try {
      setResult(undefined);
      // The parser can be recompiled with `npm run build-parsers`
      const inputTree: ParamValue[] = childRefs.current.map((childRef) =>
        childRef.computeParamValue(),
      );
      let encodedData = int.encodeFunctionData(
        func.name,
        await Promise.all(
          inputTree.map((input: ParamValue, i: number) =>
            parseStructuredArgument(input, func.inputs[i], i, provider),
          ),
        ),
      );
      let resultData = await provider.call({
        from: sender || null,
        to: address,
        data: encodedData,
        blockTag,
        value:
          value !== ""
            ? parseUnits(value, nativeCurrency.decimals ?? 18)
            : null,
      });
      setResult({
        result: int.decodeFunctionResult(func.name, resultData),
        data: resultData,
      });
      setError(null);
    } catch (e: any) {
      setResult(null);
      setError(e.toString());
    }
  }

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    submitCall();
  }

  return (
    <li key={func.format()} className="pb-4" data-test="read-function">
      <span className="text-md font-medium">{func.name}</span>
      <Accordion title="Call options">
        <form onSubmit={onFormSubmit}>
          <div className="ml-6">
            <div className="text-xs">Block Number</div>
            <input
              type="number"
              min="0"
              className="mt-1 w-96 rounded border px-2 py-1 text-sm text-gray-600"
              onChange={(e) => setBlockNumber(e.target.value)}
              placeholder="latest"
            />
            <div className="text-xs">Sender</div>
            <input
              type="text"
              className="mt-1 w-96 rounded border px-2 py-1 text-sm text-gray-600"
              onChange={(e) => setSender(e.target.value)}
              placeholder="0x0000000000000000000000000000000000000000"
            />
            <div className="text-xs">
              Value {nativeCurrency && `(${nativeCurrency.symbol})`}
            </div>
            <input
              type="text"
              className="mt-1 w-96 rounded border px-2 py-1 text-sm text-gray-600"
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
            />
            <button type="submit" className="hidden"></button>
          </div>
        </form>
      </Accordion>
      <form onSubmit={onFormSubmit} className="mt-2 pl-4">
        <ul className="ml-2 list-inside">
          {func.inputs &&
            func.inputs.map((param, index) => (
              <li className="mt-2" key={index}>
                <div className="text-sm font-medium text-gray-600">
                  <ParamDeclaration input={param} index={index} short={true} />
                </div>
                <FunctionParamInput
                  param={param}
                  ref={(component) => {
                    if (component !== null) {
                      childRefs.current[index] = component;
                    }
                  }}
                />
              </li>
            ))}
        </ul>
        <button
          className="ml-2 mt-2 rounded border bg-skin-button-fill px-3 py-1 text-left text-sm text-skin-button hover:bg-skin-button-hover-fill"
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
          <OutputDecoder
            args={result.result}
            paramTypes={showDecodedOutputs ? (func.outputs ?? []) : null}
            data={result.data}
            devMethod={devMethod}
          />
        )}
        {error && <p className="break-words font-mono text-red-500">{error}</p>}
      </div>
    </li>
  );
};

export default memo(ReadFunction);
