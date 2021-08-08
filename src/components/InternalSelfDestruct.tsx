import React, { useContext } from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import { RuntimeContext } from "../useRuntime";
import { TransactionData, InternalOperation } from "../types";

const CHI_ADDRESS = "0x0000000000004946c0e9F43F4Dee607b0eF1fA1c";
const GST2_ADDRESS = "0x0000000000b3F879cb30FE243b4Dfee438691c04";

type InternalSelfDestructProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
};

const InternalSelfDestruct: React.FC<InternalSelfDestructProps> = ({
  txData,
  internalOp,
}) => {
  const { provider } = useContext(RuntimeContext);
  const network = provider?.network;

  const toMiner = txData.miner !== undefined && internalOp.to === txData.miner;

  return (
    <>
      <div className="flex items-baseline space-x-1 text-xs">
        <span className="text-gray-500">
          <FontAwesomeIcon icon={faAngleRight} size="1x" /> SELF DESTRUCT
        </span>
        <span>Contract</span>
        <div className="flex items-baseline">
          <AddressHighlighter address={internalOp.from}>
            <DecoratedAddressLink address={internalOp.from} selfDestruct />
          </AddressHighlighter>
        </div>
        {network?.chainId === 1 && internalOp.to === CHI_ADDRESS && (
          <span className="text-gray-400">(Chi Gastoken)</span>
        )}
        {network?.chainId === 1 && internalOp.to === GST2_ADDRESS && (
          <span className="text-gray-400">(GST2 Gastoken)</span>
        )}
      </div>
      {!internalOp.value.isZero() && (
        <div className="ml-5 flex items-baseline space-x-1 text-xs">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
          </span>
          <span>{ethers.utils.formatEther(internalOp.value)} Ether</span>
          <div className="flex items-baseline">
            <span className="text-gray-500">To</span>
            <AddressHighlighter address={internalOp.to}>
              <div
                className={`flex items-baseline space-x-1 ${
                  toMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
                }`}
              >
                <DecoratedAddressLink address={internalOp.to} miner={toMiner} />
              </div>
            </AddressHighlighter>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(InternalSelfDestruct);
