import { FunctionFragment } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ContentFrame from "../../../components/ContentFrame";
import LabeledSwitch from "../../../components/LabeledSwitch";
import StandardSelectionBoundary from "../../../selection/StandardSelectionBoundary";
import { Match, MatchType } from "../../../sourcify/useSourcify";
import { RuntimeContext } from "../../../useRuntime";
import { usePageTitle } from "../../../useTitle";
import WhatsabiWarning from "../WhatsabiWarning";
import ReadFunction from "./ReadFunction";

type ContractsProps = {
  checksummedAddress: string;
  match: Match | null | undefined;
};

export function isReadFunction(abiFn: {
  type: string;
  stateMutability: string;
}) {
  return (
    abiFn.type === "function" &&
    (abiFn.stateMutability === "pure" || abiFn.stateMutability === "view")
  );
}

const ReadContract: React.FC<ContractsProps> = ({
  checksummedAddress,
  match,
}) => {
  const { provider } = useContext(RuntimeContext);
  const [showNonViewReturns, setShowNonViewReturns] = useState<boolean>(false);
  usePageTitle(`Read Contract | ${checksummedAddress}`);

  const viewFunctions = match?.metadata.output.abi.filter((fn) =>
    isReadFunction(fn),
  );
  const nonViewReturns = match?.metadata.output.abi.filter(
    (fn) => fn.outputs && fn.outputs.length > 0 && !isReadFunction(fn),
  );
  const showDecodedOutputs = match?.type !== MatchType.WHATSABI_GUESS;

  const location = useLocation();
  useEffect(() => {
    setTimeout(() => {
      if (location.hash) {
        // Scroll to fragment, e.g. "#0xabcdef01"
        let foundElement = document.getElementById(location.hash.slice(1));
        if (foundElement) {
          foundElement.scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    }, 200);
  }, [match]);

  return (
    <StandardSelectionBoundary>
      <ContentFrame tabs>
        {match && match.type === MatchType.WHATSABI_GUESS && (
          <WhatsabiWarning />
        )}
        <div className="py-5">
          {match === undefined && (
            <span>Getting data from Sourcify repository...</span>
          )}
          {match === null && (
            <span>
              Address is not a contract or couldn't find contract metadata in
              Sourcify repository.
            </span>
          )}

          {viewFunctions && (
            <div>
              {viewFunctions.length === 0 &&
                "This contract has no external view functions."}
              {(viewFunctions.length > 0 ||
                (nonViewReturns && nonViewReturns.length > 0)) && (
                <ol className="marker:text-md list-inside list-decimal marker:text-gray-400">
                  {viewFunctions.map((fn, i) => (
                    <ReadFunction
                      func={FunctionFragment.from(fn)}
                      address={checksummedAddress}
                      devMethod={
                        match?.metadata?.output?.devdoc?.methods?.[
                          FunctionFragment.from(fn).format("sighash")
                        ]
                      }
                      showDecodedOutputs={showDecodedOutputs}
                      key={i}
                    />
                  ))}
                  {nonViewReturns && nonViewReturns.length > 0 && (
                    <>
                      <LabeledSwitch
                        defaultEnabled={showNonViewReturns}
                        onToggle={setShowNonViewReturns}
                      >
                        Show non-view functions with return values
                      </LabeledSwitch>
                      {showNonViewReturns && (
                        <>
                          <hr className="pb-4" />
                          {nonViewReturns.map((fn, i) => (
                            <ReadFunction
                              func={FunctionFragment.from(fn)}
                              address={checksummedAddress}
                              devMethod={
                                match?.metadata?.output?.devdoc?.methods?.[
                                  FunctionFragment.from(fn).format("sighash")
                                ]
                              }
                              showDecodedOutputs={showDecodedOutputs}
                              key={i}
                            />
                          ))}
                        </>
                      )}
                    </>
                  )}
                </ol>
              )}
            </div>
          )}
        </div>
      </ContentFrame>
    </StandardSelectionBoundary>
  );
};

export default React.memo(ReadContract);
