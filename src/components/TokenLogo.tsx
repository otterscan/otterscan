import React, { Suspense } from "react";
import { useImage } from "react-image";

type TokenLogoProps = {
  address: string;
  name: string;
};

const TokenLogo: React.FC<TokenLogoProps> = (props) => (
  <Suspense fallback={<></>}>
    <InternalTokenLogo {...props} />
  </Suspense>
);

const InternalTokenLogo: React.FC<TokenLogoProps> = ({ address, name }) => {
  const { src } = useImage({
    srcList: [
      `http://localhost:3001/assets/${address}/logo.png`,
      "/eth-diamond-black.png",
    ],
  });

  return (
    <div className="flex items-center justify-center w-5 h-5">
      <img className="max-w-full max-h-full" src={src} alt={`${name} logo`} />
    </div>
  );
};

export default React.memo(TokenLogo);
