import { Light as SyntaxHighlighter } from "react-syntax-highlighter";

// @ts-ignore
import hljs from "highlight.js/lib/core";

// @ts-ignore
import json from "highlight.js/lib/languages/json";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";

import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);
hljs.registerLanguage("json", json);

export { SyntaxHighlighter, docco };
