import React, { useState, useEffect } from "react";

type MethodNameProps = {
  data: string;
};

const MethodName: React.FC<MethodNameProps> = ({ data }) => {
  const [name, setName] = useState<string>();
  useEffect(() => {
    if (data === "0x") {
      setName("Transfer");
      return;
    }

    let _name = data.slice(0, 10);

    // Try to resolve 4bytes name
    const fourBytes = _name.slice(2);
    const signatureURL = `http://localhost:3001/signatures/${fourBytes}`;
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
  }, [data]);

  return (
    <div className="bg-blue-50 rounded-lg px-3 py-1 min-h-full flex items-baseline text-xs max-w-max">
      <p className="truncate" title={name}>
        {name}
      </p>
    </div>
  );
};

export default React.memo(MethodName);
