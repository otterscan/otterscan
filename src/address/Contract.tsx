import React, { useState, useEffect } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import hljs from "highlight.js";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { sourcifySourceFile } from "../url";

import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);

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
    <SyntaxHighlighter language="solidity" style={docco} showLineNumbers>
      {content ?? ""}
    </SyntaxHighlighter>
  );
};

export default React.memo(Contract);
