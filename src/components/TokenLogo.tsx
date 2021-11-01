import React, { Suspense, useContext } from "react";
import { useImage } from "react-image";
import { tokenLogoURL } from "../url";
import { RuntimeContext } from "../useRuntime";

type TokenLogoProps = {
  address: string;
  name: string;
};

const TokenLogo: React.FC<TokenLogoProps> = (props) => (
  <Suspense fallback={null}>
    <InternalTokenLogo {...props} />
  </Suspense>
);

const InternalTokenLogo: React.FC<TokenLogoProps> = ({ address, name }) => {
  const { config } = useContext(RuntimeContext);

  const srcList: string[] = [];
  if (config) {
    srcList.push(tokenLogoURL(config.assetsURLPrefix ?? "", address));
  }
  srcList.push("/eth-diamond-black.png");
  const { src } = useImage({ srcList });

  return (
    <div className="flex items-center justify-center w-5 h-5">
      <img className="max-w-full max-h-full" src={src} alt={`${name} logo`} />
    </div>
  );
};

export default React.memo(TokenLogo);
