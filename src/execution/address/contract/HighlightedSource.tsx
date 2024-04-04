import { HighlighterCore, getHighlighterCore } from "shiki";
import langJson from "shiki/langs/json.mjs";
import langSolidity from "shiki/langs/solidity.mjs";
import themeGithubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";

import React, { useEffect, useState } from "react";

let highlighterSingleton: HighlighterCore | undefined = undefined;
export const getOrCreateHighlighter = async (): Promise<HighlighterCore> => {
  if (!highlighterSingleton) {
    highlighterSingleton = await getHighlighterCore({
      themes: [themeGithubLight],
      langs: [langSolidity, langJson],
      loadWasm: getWasm,
    });
  }

  return highlighterSingleton;
};

export const useHighlighter = (): HighlighterCore | undefined => {
  const [highlighter, setHighlighter] = useState<HighlighterCore | undefined>();

  useEffect(() => {
    getOrCreateHighlighter().then(setHighlighter);
  }, []);

  return highlighter;
};

type HighlightedSourceProps = {
  source?: string | null;
  langName: string;
};

const HighlightedSource: React.FC<HighlightedSourceProps> = ({
  source,
  langName,
}) => {
  const [code, setCode] = useState<string>("");
  const highlighter = useHighlighter();
  useEffect(() => {
    if (source !== undefined && source !== null && highlighter) {
      setCode(
        highlighter.codeToHtml(source, {
          lang: langName,
          theme: "github-light",
        }),
      );
    } else {
      setCode("");
    }
  }, [source, highlighter]);

  return (
    <div
      className="h-full w-full border font-code text-sm p-3"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default React.memo(HighlightedSource);
