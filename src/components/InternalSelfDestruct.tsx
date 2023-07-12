import React, { useContext } from "react";
import { formatEther } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import TransactionAddress from "../execution/components/TransactionAddress";
import { RuntimeContext } from "../useRuntime";
import { useBlockDataFromTransaction } from "../useErigonHooks";
import { useChainInfo } from "../useChainInfo";
import { TransactionData, InternalOperation } from "../types";

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
        {internalOp.value.isZero() && (
          <div className="flex items-baseline text-gray-400">
            (To: <TransactionAddress address={internalOp.to} />)
          </div>
        )}
      </div>
      {!internalOp.value.isZero() && (
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
