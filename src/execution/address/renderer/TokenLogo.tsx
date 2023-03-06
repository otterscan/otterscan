import React, { useContext } from "react";
import { useImage } from "react-image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { tokenLogoURL } from "../../../url";
import { RuntimeContext } from "../../../useRuntime";
import { ChecksummedAddress } from "../../../types";

type TokenLogoProps = {
  chainId: number;
  address: ChecksummedAddress;
  name: string;
};

const TokenLogo: React.FC<TokenLogoProps> = ({ chainId, address, name }) => {
  const { config } = useContext(RuntimeContext);

  const srcList: string[] = [];
  if (config) {
    srcList.push(tokenLogoURL(config.assetsURLPrefix ?? "", chainId, address));
  }
  const { src, isLoading } = useImage({ srcList, useSuspense: false });

  return (
    <div className="flex h-5 w-5 items-center justify-center text-gray-400">
      {src && (
        <img className="max-h-full max-w-full" src={src} alt={`${name} logo`} />
      )}
      {!src && !isLoading && <FontAwesomeIcon icon={faCoins} size="1x" />}
    </div>
  );
};

export default React.memo(TokenLogo);
