import {
  Authorization,
  concat,
  encodeRlp,
  keccak256,
  recoverAddress,
  toBeArray,
} from "ethers";
import React from "react";
import StandardTable from "../../components/StandardTable";
import StandardTBody from "../../components/StandardTBody";
import StandardTHead from "../../components/StandardTHead";
import TransactionAddress from "../components/TransactionAddress";

interface AuthorizationsTableProps {
  authorizationList: Authorization[];
}

function getAuthorizationSigner(authorization: Authorization): string {
  // Follows https://eips.ethereum.org/EIPS/eip-7702 to reconstruct the unsigned message
  const MAGIC = "0x05";
  const msg = concat([
    MAGIC,
    encodeRlp([
      toBeArray(authorization.chainId),
      authorization.address,
      toBeArray(authorization.nonce),
    ]),
  ]);
  return recoverAddress(keccak256(msg), authorization.signature);
}

const AuthorizationsTable: React.FC<AuthorizationsTableProps> = ({
  authorizationList,
}) => {
  return (
    <div className="mt-3">
      <StandardTable>
        <StandardTHead>
          <th className="w-25">Signer</th>
          <th className="w-6">Nonce</th>
          <th className="w-25">Target Address</th>
        </StandardTHead>
        <StandardTBody>
          {authorizationList.map((authorization) => {
            const signer = getAuthorizationSigner(authorization);
            return (
              <tr key={signer + authorization.nonce.toString()}>
                <td className="flex">
                  <TransactionAddress address={signer} showCodeIndicator />
                </td>
                <td>{authorization.nonce.toString()}</td>
                <td className="flex">
                  <TransactionAddress
                    address={authorization.address}
                    showCodeIndicator
                  />
                </td>
              </tr>
            );
          })}
        </StandardTBody>
      </StandardTable>
    </div>
  );
};

export default AuthorizationsTable;
