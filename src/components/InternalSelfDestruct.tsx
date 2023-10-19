import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatEther } from "ethers";
import React, { useContext } from "react";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import TransactionAddress from "../execution/components/TransactionAddress";
import { InternalOperation, TransactionData } from "../types";
import { useChainInfo } from "../useChainInfo";
import { useBlockDataFromTransaction } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import AddressHighlighter from "./AddressHighlighter";

type InternalSelfDestructProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
};

const InternalSelfDestruct: React.FC<InternalSelfDestructProps> = ({
  txData,
  internalOp,
}) => {
  const { provider } = useContext(RuntimeContext);
  const block = useBlockDataFromTransaction(provider, txData);
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const toMiner = block?.miner !== undefined && internalOp.to === block.miner;

  return (
    <>
      <div className="flex items-baseline space-x-1 whitespace-nowrap">
        <span className="text-gray-500">
          <FontAwesomeIcon icon={faAngleRight} size="1x" /> SELF DESTRUCT
        </span>
        <div className="flex items-baseline">
          <AddressHighlighter address={internalOp.from}>
            <DecoratedAddressLink address={internalOp.from} selfDestruct />
          </AddressHighlighter>
        </div>
        {internalOp.value === 0n && (
          <div className="flex items-baseline text-gray-400">
            (To: <TransactionAddress address={internalOp.to} />)
          </div>
        )}
      </div>
      {internalOp.value !== 0n && (
        <div className="ml-5 flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
          </span>
          <span>
            {formatEther(internalOp.value)} {symbol}
          </span>
          <div className="flex items-baseline">
            <span className="text-gray-500">To</span>
            <AddressHighlighter address={internalOp.to}>
              <div
                className={`flex items-baseline space-x-1 ${
                  toMiner ? "rounded bg-amber-100 px-2 py-1" : ""
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

export default InternalSelfDestruct;
