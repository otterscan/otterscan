import React, { useEffect, useState } from "react";
import {
  DecorationItem,
  DecorationOptions,
  HighlighterCore,
  getHighlighterCore,
} from "shiki";
import langJson from "shiki/langs/json.mjs";
import langSolidity from "shiki/langs/solidity.mjs";
import themeGithubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";

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

// Bounds decoration offsets to the range Shiki expects
const boundDecorationOffsets = (
  decoration: DecorationItem,
  sourceLength: number,
): DecorationItem => {
  if (
    typeof decoration.start === "number" &&
    typeof decoration.end === "number"
  ) {
    return {
      ...decoration,
      start: Math.max(0, Math.min(decoration.start, sourceLength)),
      end: Math.max(0, Math.min(decoration.end, sourceLength)),
    };
  }
  return decoration;
};

type HighlightedSourceProps = {
  source?: string | null;
  langName: string;
  decorations?: DecorationOptions["decorations"];
};

const HighlightedSource: React.FC<HighlightedSourceProps> = ({
  source,
  langName,
  decorations,
}) => {
  const [code, setCode] = useState<string>("");
  const highlighter = useHighlighter();
  useEffect(() => {
    if (source !== undefined && source !== null && highlighter) {
      const boundedDecorations = decorations
        ? decorations.map((decoration) =>
            boundDecorationOffsets(decoration, source.length),
          )
        : undefined;
      setCode(
        highlighter.codeToHtml(source, {
          lang: langName,
          theme: "github-light",
          ...(boundedDecorations && { decorations: boundedDecorations }),
        }),
      );
    } else {
      setCode("");
    }
  }, [source, highlighter, langName, decorations]);

  return (
    <div
      className="h-full w-full border font-code text-sm p-3 [&_code]:[counter-reset:step] [&_code]:[counter-increment:step_0] [&_span.line]:before:content-[counter(step)] [&_span.line]:before:[counter-increment:step] [&_span.line]:before:w-4 [&_span.line]:before:mr-6 [&_span.line]:before:inline-block [&_span.line]:before:text-right [&_span.line]:before:text-source-line-numbers"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default React.memo(HighlightedSource);
