import { useState, useEffect, useContext } from "react";
import { RuntimeContext } from "./useRuntime";
import { fourBytesURL } from "./url";

const cache = new Map<string, string | null>();

export const use4Bytes = (rawFourBytes: string) => {
  const runtime = useContext(RuntimeContext);
  const assetsURLPrefix = runtime.config?.assetsURLPrefix;

  const [name, setName] = useState<string>();
  const [fourBytes, setFourBytes] = useState<string>();
  useEffect(() => {
    if (assetsURLPrefix === undefined || fourBytes === undefined) {
      return;
    }

    const signatureURL = fourBytesURL(assetsURLPrefix, fourBytes);
    fetch(signatureURL)
      .then(async (res) => {
        if (!res.ok) {
          console.error(`Signature does not exist in 4bytes DB: ${fourBytes}`);

          // Use the default 4 bytes as name
          setName(rawFourBytes);
          cache.set(fourBytes, null);
          return;
        }

        const sig = await res.text();
        const cut = sig.indexOf("(");
        let method = sig.slice(0, cut);
        method = method.charAt(0).toUpperCase() + method.slice(1);
        setName(method);
        cache.set(fourBytes, method);
        return;
      })
      .catch((err) => {
        console.error(`Couldn't fetch signature URL ${signatureURL}`, err);

        // Use the default 4 bytes as name
        setName(rawFourBytes);
      });
  }, [rawFourBytes, assetsURLPrefix, fourBytes]);

  if (rawFourBytes === "0x") {
    return "Transfer";
  }
  if (assetsURLPrefix === undefined) {
    return rawFourBytes;
  }

  // Try to resolve 4bytes name
  const entry = cache.get(rawFourBytes.slice(2));
  if (entry === null) {
    return rawFourBytes;
  }
  if (entry !== undefined) {
    // Simulates LRU
    cache.delete(entry);
    cache.set(rawFourBytes.slice(2), entry);
    return entry;
  }
  if (name === undefined && fourBytes === undefined) {
    setFourBytes(rawFourBytes.slice(2));
    return "";
  }

  return name;
};
