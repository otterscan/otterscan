import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faQuestionCircle as faQuestionCircleSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch } from "@headlessui/react";
import { ParamType, Result } from "ethers";
import { FC, memo, useState } from "react";
import { DevMethod, UserMethod } from "../../../sourcify/useSourcify";
import DecodedParamRow from "./DecodedParamRow";

type DecodedParamsTableProps = {
  args: Result;
  paramTypes: readonly ParamType[];
  hasParamNames?: boolean;
  userMethod?: UserMethod | undefined;
  devMethod?: DevMethod | undefined;
  defaultNameBase?: string;
  signature?: string;
};

const DecodedParamsTable: FC<DecodedParamsTableProps> = ({
  args,
  paramTypes,
  hasParamNames = true,
  userMethod,
  devMethod,
  defaultNameBase = "param",
  signature,
}) => {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const hasHelp =
    (userMethod && userMethod.notice) || (devMethod && devMethod.details);
  return (
    <table className="w-full border">
      <thead className="bg-gray-100 text-left">
        <div className="mt-1">
          <span className="mx-1 font-code text-gray-600 font-weight-1000">
            {hasHelp && (
              <Switch
                checked={showHelp}
                onChange={setShowHelp}
                className="self-center text-gray-500 pr-2"
              >
                <FontAwesomeIcon
                  icon={showHelp ? faQuestionCircleSolid : faQuestionCircle}
                  size="1x"
                />
              </Switch>
            )}
            {signature}
          </span>
        </div>
        {hasHelp && (
          <>
            {showHelp && (
              <div>
                {userMethod && userMethod.notice && (
                  <tr className="grid grid-cols-12 gap-x-2 pt-1">
                    <th className="col-span-12 px-1 font-normal">
                      {userMethod.notice}
                    </th>
                  </tr>
                )}
                {devMethod && devMethod.details && (
                  <tr className="grid grid-cols-12 gap-x-2 pt-1">
                    <th className="col-span-12 px-1 font-normal">
                      <span className="font-bold italic text-xs mr-2 select-none">
                        dev{" "}
                      </span>
                      {devMethod.details}
                    </th>
                  </tr>
                )}
              </div>
            )}
          </>
        )}
        <tr className="grid grid-cols-12 gap-x-2 py-2">
          <th className="col-span-3 pl-1">
            name <span className="text-xs text-gray-400">(index)</span>
          </th>
          <th className="col-span-1">type</th>
          <th className="col-span-8 pr-1">value</th>
        </tr>
        {!hasParamNames && (
          <tr className="grid grid-cols-12 gap-x-2 bg-amber-100 py-2 text-red-700">
            <th className="col-span-12 px-1">
              {paramTypes.length > 0 && paramTypes[0].name !== ""
                ? "Parameter names are estimated."
                : "Parameter names are not available."}
            </th>
          </tr>
        )}
      </thead>
      <tbody className="divide-y">
        {args.map((r, i) => (
          <DecodedParamRow
            key={i}
            i={i}
            r={r}
            paramType={paramTypes[i]}
            help={devMethod?.params?.[paramTypes[i].name]}
            defaultNameBase={defaultNameBase}
          />
        ))}
      </tbody>
    </table>
  );
};

export default memo(DecodedParamsTable);
