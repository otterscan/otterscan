import { FunctionFragment } from "ethers";
import React, { useContext } from "react";
import ContentFrame from "../../../components/ContentFrame";
import StandardSelectionBoundary from "../../../selection/StandardSelectionBoundary";
import { Match } from "../../../sourcify/useSourcify";
import { RuntimeContext } from "../../../useRuntime";
import ReadFunction from "./ReadFunction";

type ContractsProps = {
  checksummedAddress: string;
  match: Match | null | undefined;
};

function isReadFunction(abiFn: { type: string; stateMutability: string }) {
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
  const viewFunctions = match?.metadata.output.abi.filter((fn) =>
    isReadFunction(fn),
  );

  return (
    <StandardSelectionBoundary>
      <ContentFrame tabs>
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
              {viewFunctions.length > 0 && (
                <ol className="marker:text-md list-inside list-decimal marker:text-gray-400">
                  {viewFunctions.map((fn, i) => (
                    <ReadFunction
                      func={FunctionFragment.from(fn)}
                      address={checksummedAddress}
                      key={i}
                    />
                  ))}
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
