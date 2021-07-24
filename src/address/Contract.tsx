import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import ContentFrame from "../ContentFrame";
import Highlight from "react-highlight";
import InfoRow from "../components/InfoRow";
import { sourcifyMetadata } from "../url";
import { RuntimeContext } from "../useRuntime";

import "highlight.js/styles/stackoverflow-light.css";
import hljs from "highlight.js";
import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);
hljs.initHighlightingOnLoad();

type ContractProps = {
  checksummedAddress: string;
};

const Contract: React.FC<ContractProps> = ({ checksummedAddress }) => {
  const { provider } = useContext(RuntimeContext);
  const [rawMetadata, setRawMetadata] = useState<any>();
  useEffect(() => {
    if (!checksummedAddress) {
      return;
    }

    const fetchMetadata = async () => {
      try {
        const result = await fetch(
          sourcifyMetadata(checksummedAddress, provider!.network.chainId)
        );
        if (result.ok) {
          const json = await result.json();
          console.log(json);
          setRawMetadata(json);
          setSelected(Object.keys(json.sources)[0]);
        } else {
          setRawMetadata(null);
        }
      } catch (err) {
        console.error(err);
        setRawMetadata(null);
      }
    };
    fetchMetadata();
  }, [provider, checksummedAddress]);

  const [selected, setSelected] = useState<string>();

  const optimizer = rawMetadata?.settings?.optimizer;

  return (
    <ContentFrame tabs>
      {rawMetadata && (
        <>
          <InfoRow title="Compiler">
            <span>{rawMetadata.compiler?.version}</span>
          </InfoRow>
          <InfoRow title="Optimizer Enabled">
            {optimizer?.enabled ? (
              <span>
                <span className="font-bold text-green-600">Yes</span> with{" "}
                <span className="font-bold text-green-600">
                  {ethers.utils.commify(optimizer?.runs)}
                </span>{" "}
                runs
              </span>
            ) : (
              <span className="font-bold text-red-600">No</span>
            )}
          </InfoRow>
        </>
      )}
      <div className="py-5">
        {rawMetadata === null && (
          <span>Couldn't find contract metadata in Sourcify repository.</span>
        )}
        {rawMetadata !== undefined && rawMetadata !== null && (
          <div>
            {Object.entries(rawMetadata.sources).map(([k]) => (
              <button
                className={`border-b-2 border-transparent rounded-t text-sm px-2 py-1 bg-gray-200 text-gray-500 ${
                  selected === k ? "border-orange-300 font-bold" : ""
                }`}
              >
                {k}
              </button>
            ))}
            {selected && (
              <Highlight className="w-full h-full border focus:outline-none font-code text-base">
                {rawMetadata.sources[selected].content}
              </Highlight>
            )}
          </div>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Contract);
