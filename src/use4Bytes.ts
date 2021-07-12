import { useState, useEffect, useContext } from "react";
import { RuntimeContext } from "./useRuntime";
import { fourBytesURL } from "./url";

export const use4Bytes = (data: string) => {
  const runtime = useContext(RuntimeContext);

  const [name, setName] = useState<string>();
  useEffect(() => {
    if (data === "0x") {
      setName("Transfer");
      return;
    }

    let _name = data.slice(0, 10);

    // Try to resolve 4bytes name
    const fourBytes = _name.slice(2);
    const { config } = runtime;
    if (!config) {
      setName(_name);
      return;
    }

    const signatureURL = fourBytesURL(config.assetsURLPrefix ?? "", fourBytes);
    fetch(signatureURL)
      .then(async (res) => {
        if (!res.ok) {
          console.error(`Signature does not exist in 4bytes DB: ${fourBytes}`);
          return;
        }

        const sig = await res.text();
        const cut = sig.indexOf("(");
        let method = sig.slice(0, cut);
        method = method.charAt(0).toUpperCase() + method.slice(1);
        setName(method);
        return;
      })
      .catch((err) => {
        console.error(`Couldn't fetch signature URL ${signatureURL}`, err);
      });

    // Use the default 4 bytes as name
    setName(_name);
  }, [runtime, data]);

  return name;
};
