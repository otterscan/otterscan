import React, { useState } from "react";
import Highlight from "react-highlight";

import "highlight.js/styles/stackoverflow-light.css";
import hljs from "highlight.js";
import hljsDefineSolidity from "highlightjs-solidity";
import { useEffect } from "react";
import { sourcifySourceFile } from "../url";
hljsDefineSolidity(hljs);
hljs.initHighlightingOnLoad();

type ContractProps = {
  checksummedAddress: string;
  networkId: number;
  filename: string;
  source: any;
};

const Contract: React.FC<ContractProps> = ({
  checksummedAddress,
  networkId,
  filename,
  source,
}) => {
  const [content, setContent] = useState<string>(source.content);
  useEffect(() => {
    if (source.content) {
      return;
    }

    const readContent = async () => {
      const normalizedFilename = filename.replaceAll("@", "_");
      const url = sourcifySourceFile(
        checksummedAddress,
        networkId,
        normalizedFilename
      );
      const res = await fetch(url);
      if (res.ok) {
        const _content = await res.text();
        setContent(_content);
      }
    };
    readContent();
  }, [checksummedAddress, networkId, filename, source.content]);

  return (
    <Highlight className="w-full h-full border focus:outline-none font-code text-base">
      {content}
    </Highlight>
  );
};

export default React.memo(Contract);
