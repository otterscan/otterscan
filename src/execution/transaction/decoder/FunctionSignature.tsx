import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faQuestionCircle as faQuestionCircleSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch } from "@headlessui/react";
import { FunctionFragment, ParamType } from "ethers";
import { FC, useState } from "react";
import { DevMethod, UserMethod } from "../../../sourcify/useSourcify";
import ParamDeclaration from "../../components/ParamDeclaration";

type FunctionSignatureProps = {
  userMethod?: UserMethod | undefined;
  devMethod?: DevMethod | undefined;
  fragment: FunctionFragment;
};

const FunctionSignature: FC<FunctionSignatureProps> = ({
  userMethod,
  devMethod,
  fragment,
}) => {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const hasHelp =
    (userMethod && userMethod.notice) || (devMethod && devMethod.details);
  return (
    <div>
      <div>
        <span className="font-mono text-sm text-gray-800">
          <span className="font-bold">{fragment.name}</span>
          {"("}
          {fragment.inputs.map((param: ParamType, index: number) => (
            <>
              <ParamDeclaration input={param} index={index} />
              {index !== fragment.inputs.length - 1 && <>, </>}
            </>
          ))}
          {")"}
        </span>
        {hasHelp && (
          <Switch
            checked={showHelp}
            onChange={setShowHelp}
            className="self-center text-gray-500 pr-2 ml-1"
          >
            <FontAwesomeIcon
              icon={showHelp ? faQuestionCircleSolid : faQuestionCircle}
              size="1x"
            />
          </Switch>
        )}
      </div>
      {hasHelp && (
        <>
          {showHelp && (
            <div>
              {userMethod && userMethod.notice && (
                <div className="gap-x-2 pt-1 px-1 font-normal">
                  {userMethod.notice}
                </div>
              )}
              {devMethod && devMethod.details && (
                <div className="gap-x-2 pt-1 px-1 font-normal">
                  <span className="font-bold italic text-xs mr-2 select-none">
                    dev{" "}
                  </span>
                  {devMethod.details}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FunctionSignature;
