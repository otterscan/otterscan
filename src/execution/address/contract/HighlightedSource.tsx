import React, { useEffect, useState } from "react";
import {
  HighlighterCore,
  createHighlighterCore,
  type LanguageInput,
  type SpecialLanguage,
} from "shiki";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import langJson from "shiki/langs/json.mjs";
import langSolidity from "shiki/langs/solidity.mjs";
import themeGithubLight from "shiki/themes/github-light.mjs";

type HighlightedSourceProps = {
  source?: string | null;
  langName: string;
};

let highlighterSingleton: HighlighterCore | undefined = undefined;

export const getOrCreateHighlighter = async (): Promise<HighlighterCore> => {
  if (!highlighterSingleton) {
    highlighterSingleton = await createHighlighterCore({
      themes: [themeGithubLight],
      langs: [langSolidity, langJson],
      engine: createOnigurumaEngine(() => import("shiki/wasm")),
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

async function loadLanguage(highlighter: HighlighterCore, langName: string) {
  if (!highlighter.getLoadedLanguages().includes(langName)) {
    let langModule: undefined | LanguageInput | SpecialLanguage = undefined;

    switch (langName) {
      case "vyper":
        langModule = await import(`@shikijs/langs/vyper`);
        break;
      default:
        break;
    }
    if (langModule !== undefined) {
      await highlighter.loadLanguage(langModule);
    }
  }
}

const HighlightedSource: React.FC<HighlightedSourceProps> = ({
  source,
  langName,
}) => {
  const [code, setCode] = useState<string>("");
  const highlighter = useHighlighter();
  useEffect(() => {
    async function loadAndHighlight() {
      if (source !== undefined && source !== null && highlighter) {
        await loadLanguage(highlighter, langName);
        setCode(
          highlighter.codeToHtml(source, {
            lang: langName,
            theme: "github-light",
          }),
        );
      } else {
        setCode("");
      }
    }
    loadAndHighlight();
  }, [source, highlighter, langName]);

  return (
    <div
      className="h-full w-full border font-code text-sm p-3 [&_code]:[counter-reset:step] [&_code]:[counter-increment:step_0] [&_span.line]:before:content-[counter(step)] [&_span.line]:before:[counter-increment:step] [&_span.line]:before:w-4 [&_span.line]:before:mr-6 [&_span.line]:before:inline-block [&_span.line]:before:text-right [&_span.line]:before:text-source-line-numbers"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default React.memo(HighlightedSource);
