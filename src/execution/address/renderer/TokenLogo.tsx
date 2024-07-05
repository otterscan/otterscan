import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo, useContext } from "react";
import { useImage } from "react-image";
import { ChecksummedAddress } from "../../../types";
import { tokenLogoURL } from "../../../url";
import { RuntimeContext } from "../../../useRuntime";

type TokenLogoProps = {
  chainId: bigint;
  address: ChecksummedAddress;
  name: string;
};

const TokenLogo: FC<TokenLogoProps> = ({ chainId, address, name }) => {
  const { config } = useContext(RuntimeContext);

  const srcList: string[] = [];
  srcList.push(tokenLogoURL(config.assetsURLPrefix ?? "", chainId, address));
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

export default memo(TokenLogo);
