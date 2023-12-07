import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ParamType } from "ethers";
import {
  forwardRef,
  memo,
  useImperativeHandle,
  useReducer,
  useRef,
} from "react";
import ParamDeclaration from "../../components/ParamDeclaration";

// Computed param value type
export type ParamValue = string | ParamValue[];
// State of a FunctionParamInput: either the entered string or an array of UUIDs
export type ParamNodeState = string | string[];

export interface ParamComponentRef {
  computeParamValue: () => ParamValue;
}

interface Action {
  type: "ADD_VALUE" | "REMOVE_VALUE" | "UPDATE_VALUE";
  // Index of a ParamValue to remove
  index?: number;
  // New value when a string is updated
  newValue?: string;
}

// Retrieve a unique key name for using across element additions/deletions
function getUUID(): string {
  return crypto.randomUUID();
}

const reducer = (state: ParamNodeState, action: Action): ParamNodeState => {
  if (typeof state === "string") {
    if (action.type === "UPDATE_VALUE" && action.newValue !== undefined) {
      return action.newValue;
    }
    return state;
  }
  switch (action.type) {
    case "ADD_VALUE":
      return [...state, getUUID()];
    case "REMOVE_VALUE":
      if (action.index === undefined) {
        return state;
      }
      return state.toSpliced(action.index, 1);
    default:
      return state;
  }
};

interface FunctionParamInputProps {
  param: ParamType;
}

/**
 * Creates an input for a single paramter, automatically creating child
 * components for tuples and arrays. Buttons for adding and removing elements
 * are included for dynamic-length array parameters. The expanded state of
 * entered elements can be computed via refs with
 * ref.current.computeParamValue().
 */
const FunctionParamInput = forwardRef<
  ParamComponentRef,
  FunctionParamInputProps
>(({ param }, ref) => {
  const [paramValue, dispatch] = useReducer(
    reducer,
    ["tuple", "array"].includes(param.baseType)
      ? param.baseType === "array" && param.arrayLength !== -1
        ? Array.from({ length: param.arrayLength! }, getUUID)
        : [getUUID()]
      : "",
  );
  const childRefs = useRef<ParamComponentRef[]>([]);

  // Recursively compute an expanded ParamValue
  const computeParamValue = (): ParamValue => {
    if (Array.isArray(paramValue)) {
      return childRefs.current.map((childRef, index) =>
        childRef.computeParamValue(),
      );
    }
    return paramValue;
  };

  // Register accessor for child data
  useImperativeHandle(ref, () => ({
    computeParamValue,
  }));

  return typeof paramValue === "string" ? (
    <input
      type="text"
      className="mt-1 w-full rounded border px-2 py-1 text-sm text-gray-600"
      placeholder={param.format("full")}
      onChange={(e) =>
        dispatch({ type: "UPDATE_VALUE", newValue: e.target.value })
      }
    />
  ) : param.baseType === "tuple" ? (
    <ul className="ml-4 list-inside">
      {param.components!.map((param: ParamType, index: number) => {
        return (
          <li key={index}>
            <span className="text-sm font-medium text-gray-600">
              <ParamDeclaration input={param} index={index} />
            </span>
            <FunctionParamInput
              param={param}
              ref={(childRef) => {
                if (childRef !== null) {
                  childRefs.current[index] = childRef;
                }
              }}
            />
          </li>
        );
      })}
    </ul>
  ) : param.baseType === "array" ? (
    <>
      <ul
        className={`ml-2 list-inside${param.arrayLength === -1 ? " mb-2" : ""}`}
      >
        {paramValue.map((entryKey: string, index: number) => (
          <li
            className={`ml-2${param.arrayLength === -1 ? " mb-3" : ""}`}
            key={entryKey}
          >
            <div className="text-sm font-medium text-gray-600 flex items-end">
              <ParamDeclaration input={param.arrayChildren!} index={index} />{" "}
              {param.arrayLength === -1 && (
                <button
                  className="bg-skin-button-fill text-skin-button hover:bg-skin-button-hover-fill py-1 px-2 rounded border inline-flex items-center ml-3"
                  type="button"
                  onClick={(event) => {
                    childRefs.current = childRefs.current.toSpliced(index, 1);
                    dispatch({ type: "REMOVE_VALUE", index: index });
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                  Remove
                </button>
              )}
            </div>
            <FunctionParamInput
              param={param.arrayChildren!}
              ref={(childRef) => {
                if (childRef !== null) {
                  childRefs.current[index] = childRef;
                }
              }}
            />
          </li>
        ))}
      </ul>
      {param.arrayLength === -1 && (
        <span className="text-sm font-medium text-gray-600">
          <button
            className="bg-skin-button-fill text-skin-button hover:bg-skin-button-hover-fill py-1 px-2 rounded border inline-flex items-center ml-4"
            type="button"
            onClick={(event) => {
              event.preventDefault();
              dispatch({ type: "ADD_VALUE" });
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Element
          </button>
        </span>
      )}
    </>
  ) : (
    <></>
  );
});

export default memo(FunctionParamInput);
