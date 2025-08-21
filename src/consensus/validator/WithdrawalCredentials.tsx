import { dataSlice, getAddress, toBeArray, toBeHex } from "ethers";
import { FC, memo } from "react";
import HexValue from "../../components/HexValue";
import DecoratedAddressLink from "../../execution/components/DecoratedAddressLink";

type WithdrawalCredentialsProps = {
  credentials: string;
};

const WithdrawalCredentials: FC<WithdrawalCredentialsProps> = ({
  credentials,
}) => {
  const credentialsType = toBeArray(credentials)[0];

  switch (credentialsType) {
    case 1:
    case 2: {
      // Extract the last 20 bytes to form the address
      const checksummedAddress = getAddress(
        dataSlice(credentials, 32 - 20, 32),
      );
      return (
        <div className="flex space-x-2">
          <span>
            <HexValue value={toBeHex(credentialsType)} />:
          </span>
          <DecoratedAddressLink address={checksummedAddress} />
        </div>
      );
    }
    default:
      return (
        <div className="flex space-x-2">
          <span>
            <HexValue value={dataSlice(credentials, 0, 1)} />:
          </span>
          <HexValue value={credentials} />
        </div>
      );
  }
};

export default memo(WithdrawalCredentials);
