import { FC, memo, useContext, useState, FormEvent } from "react";
import { SyntaxHighlighter, docco } from "../../../highlight-init";
import { FunctionFragment, Result, Interface } from "@ethersproject/abi";
import { RuntimeContext } from "../../../useRuntime";
import { parse } from "./contractInputDataParser";
import DecodedParamsTable from "../../transaction/decoder/DecodedParamsTable";

interface ReadFunctionProps {
  address: string;
  func: FunctionFragment;
}

const ReadFunction: FC<ReadFunctionProps> = ({ address, func }) => {
  let [result, setResult] = useState<Result | null>(null);
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
          inputs.map((input) => parse(input).ast?.values?.value[0])
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
        </button>
        <div className="mt-2 pl-2">
          {result && (
            <DecodedParamsTable args={result} paramTypes={func.outputs || []} />
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </form>
    </li>
  );
};

export default memo(ReadFunction);
