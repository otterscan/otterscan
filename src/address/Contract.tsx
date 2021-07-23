import React, { useState, useEffect } from "react";
import ContentFrame from "../ContentFrame";
import Highlight from "react-highlight";

import "highlight.js/styles/stackoverflow-light.css";
import hljs from "highlight.js";
import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);
hljs.initHighlightingOnLoad();

type ContractProps = {
  checksummedAddress: string;
};

const Contract: React.FC<ContractProps> = ({ checksummedAddress }) => {
  const [sources, setSources] = useState<
    { [fileName: string]: any } | undefined | null
  >(undefined);
  useEffect(() => {
    if (!checksummedAddress) {
      return;
    }

    const fetchMetadata = async () => {
      try {
        const result = await fetch(
          `https://repo.sourcify.dev/contracts/full_match/1/${checksummedAddress}/metadata.json`
        );
        if (result.ok) {
          const json = await result.json();
          console.log(json);
          setSources(json.sources);
          setSelected(Object.keys(json.sources)[0]);
        } else {
          setSources(null);
        }
      } catch (err) {
        console.error(err);
        setSources(null);
      }
    };
    fetchMetadata();
  }, [checksummedAddress]);

  const [selected, setSelected] = useState<string>();

  return (
    <ContentFrame tabs>
      <div className="py-5">
        {sources === null && (
          <span>Couldn't find contract metadata in Sourcify repository.</span>
        )}
        {sources !== undefined && sources !== null && (
          <>
            {Object.entries(sources).map(([k]) => (
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
                {sources[selected].content}
              </Highlight>
            )}
          </>
        )}
      </div>
    </ContentFrame>
  );
};

export default React.memo(Contract);
