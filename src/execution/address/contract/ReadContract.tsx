import React, { useState, useEffect, useContext } from "react";
import { FunctionFragment } from "ethers";
import { Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import ContentFrame from "../../../components/ContentFrame";
import InfoRow from "../../../components/InfoRow";
import { RuntimeContext } from "../../../useRuntime";
import { Match, MatchType } from "../../../sourcify/useSourcify";
import ContractABI from "../contract/ContractABI";
import ReadFunction from "./ReadFunction";
import StandardSelectionBoundary from "../../../selection/StandardSelectionBoundary";
import { commify } from "../../../utils/utils";

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
    isReadFunction(fn)
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
                <ul className="list-inside list-decimal">
                  {viewFunctions.map((fn, i) => (
                    <ReadFunction
                      func={FunctionFragment.from(fn)}
                      address={checksummedAddress}
                      key={i}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </ContentFrame>
    </StandardSelectionBoundary>
  );
};

export default React.memo(ReadContract);
