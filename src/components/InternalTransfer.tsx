import React, { useContext } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "@ethersproject/units";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons/faCaretRight";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons/faSackDollar";
import AddressHighlighter from "./AddressHighlighter";
import DecoratedAddressLink from "./DecoratedAddressLink";
import USDAmount from "./USDAmount";
import { RuntimeContext } from "../useRuntime";
import { useHasCode } from "../useErigonHooks";
import { useChainInfo } from "../useChainInfo";
import { TransactionData, InternalOperation } from "../types";

type InternalTransferProps = {
  txData: TransactionData;
  internalOp: InternalOperation;
  // TODO: migrate all this logic to SWR
  ethUSDPrice: BigNumber | undefined;
};

const InternalTransfer: React.FC<InternalTransferProps> = ({
  txData,
  internalOp,
  ethUSDPrice,
}) => {
  const {
    nativeCurrency: { symbol, decimals },
  } = useChainInfo();
  const fromMiner =
    txData.confirmedData?.miner !== undefined &&
    internalOp.from === txData.confirmedData.miner;
  const toMiner =
    txData.confirmedData?.miner !== undefined &&
    internalOp.to === txData.confirmedData.miner;

  const { provider } = useContext(RuntimeContext);
  const fromHasCode = useHasCode(
    provider,
    internalOp.from,
    txData.confirmedData ? txData.confirmedData.blockNumber - 1 : undefined
  );
  const toHasCode = useHasCode(
    provider,
    internalOp.to,
    txData.confirmedData ? txData.confirmedData.blockNumber - 1 : undefined
  );

  return (
    <div className="flex items-baseline space-x-1 truncate">
      <div className="grid grid-cols-6 gap-x-1 w-full items-baseline">
        <div className="col-span-2 flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faAngleRight} size="1x" /> TRANSFER
          </span>
          <div className="flex items-baseline truncate">
            <AddressHighlighter address={internalOp.from}>
              <div
                className={`flex items-baseline space-x-1 ${
                  fromMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
                }`}
              >
                <DecoratedAddressLink
                  address={internalOp.from}
                  miner={fromMiner}
                  txFrom={internalOp.from === txData.from}
                  txTo={internalOp.from === txData.to}
                  eoa={fromHasCode === undefined ? undefined : !fromHasCode}
                />
              </div>
            </AddressHighlighter>
          </div>
        </div>
        <div className="col-span-2 flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faCaretRight} size="1x" />
          </span>
          <AddressHighlighter address={internalOp.to}>
            <div
              className={`flex items-baseline space-x-1 ${
                toMiner ? "rounded px-2 py-1 bg-yellow-100" : ""
              }`}
            >
              <DecoratedAddressLink
                address={internalOp.to}
                miner={toMiner}
                txFrom={internalOp.to === txData.from}
                txTo={internalOp.to === txData.to}
                eoa={toHasCode === undefined ? undefined : !toHasCode}
              />
            </div>
          </AddressHighlighter>
        </div>
        <div className="col-span-2 flex items-baseline space-x-1">
          <span className="text-gray-500">
            <FontAwesomeIcon icon={faSackDollar} size="1x" />
          </span>
          <span>
            {formatEther(internalOp.value)} {symbol}
          </span>
          {ethUSDPrice && (
            <span className="px-2 border-gray-200 border rounded-lg bg-gray-100 text-gray-600">
              <USDAmount
                amount={internalOp.value}
                amountDecimals={decimals}
                quote={ethUSDPrice}
                // TODO: migrate to SWR and standardize this magic number
                quoteDecimals={8}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalTransfer;
