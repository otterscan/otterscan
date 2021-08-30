import React, { useMemo, useState } from "react";
import { formatEther } from "@ethersproject/units";
import { toUtf8String } from "@ethersproject/strings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faCube } from "@fortawesome/free-solid-svg-icons/faCube";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import BlockLink from "../components/BlockLink";
import BlockConfirmations from "../components/BlockConfirmations";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import Copy from "../components/Copy";
import Nonce from "../components/Nonce";
import Timestamp from "../components/Timestamp";
import InternalTransactionOperation from "../components/InternalTransactionOperation";
import MethodName from "../components/MethodName";
import TransactionType from "../components/TransactionType";
import RewardSplit from "./RewardSplit";
import GasValue from "../components/GasValue";
import UnitValue from "../components/UnitValue";
import TokenTransferItem from "../TokenTransferItem";
import { TransactionData, InternalOperation } from "../types";
import PercentageBar from "../components/PercentageBar";
import ExternalLink from "../components/ExternalLink";
import RelativePosition from "../components/RelativePosition";
import PercentagePosition from "../components/PercentagePosition";

type DetailsProps = {
  txData: TransactionData;
  internalOps?: InternalOperation[];
  sendsEthToMiner: boolean;
};

const Details: React.FC<DetailsProps> = ({
  txData,
  internalOps,
  sendsEthToMiner,
}) => {
  const hasEIP1559 =
    txData.blockBaseFeePerGas !== undefined &&
    txData.blockBaseFeePerGas !== null;
  const [inputMode, setInputMode] = useState<number>(0);

  const utfInput = useMemo(() => {
    try {
      return txData && toUtf8String(txData.data);
    } catch (err) {
      console.error("Error while converting input data to string");
      console.error(err);
      return "<can't decode>";
    }
  }, [txData]);

  return (
    <ContentFrame tabs>
      <InfoRow title="Transaction Hash">
        <div className="flex items-baseline space-x-2">
          <span className="font-hash">{txData.transactionHash}</span>
          <Copy value={txData.transactionHash} />
        </div>
      </InfoRow>
      <InfoRow title="Status">
        {txData.status ? (
          <span className="flex items-center w-min rounded-lg space-x-1 px-3 py-1 bg-green-50 text-green-500 text-xs">
            <FontAwesomeIcon icon={faCheckCircle} size="1x" />
            <span>Success</span>
          </span>
        ) : (
          <span className="flex items-center w-min rounded-lg space-x-1 px-3 py-1 bg-red-50 text-red-500 text-xs">
            <FontAwesomeIcon icon={faTimesCircle} size="1x" />
            <span>Fail</span>
          </span>
        )}
      </InfoRow>
      <InfoRow title="Block / Position">
        <div className="flex items-baseline divide-x-2 divide-dotted divide-gray-300">
          <div className="flex space-x-1 items-baseline mr-3">
            <span className="text-orange-500">
              <FontAwesomeIcon icon={faCube} />
            </span>
            <BlockLink blockTag={txData.blockNumber} />
            <BlockConfirmations confirmations={txData.confirmations} />
          </div>
          <div className="flex space-x-2 items-baseline pl-3">
            <RelativePosition
              pos={txData.transactionIndex}
              total={txData.blockTransactionCount - 1}
            />
            <PercentagePosition
              perc={
                txData.transactionIndex / (txData.blockTransactionCount - 1)
              }
            />
          </div>
        </div>
      </InfoRow>
      <InfoRow title="Timestamp">
        <Timestamp value={txData.timestamp} />
      </InfoRow>
      <InfoRow title="From / Nonce">
        <div className="flex divide-x-2 divide-dotted divide-gray-300">
          <div className="flex items-baseline space-x-2 -ml-1 mr-3">
            <AddressHighlighter address={txData.from}>
              <DecoratedAddressLink
                address={txData.from}
                miner={txData.from === txData.miner}
                txFrom
              />
            </AddressHighlighter>
            <Copy value={txData.from} />
          </div>
          <div className="flex items-baseline pl-3">
            <Nonce value={txData.nonce} />
          </div>
        </div>
      </InfoRow>
      <InfoRow title={txData.to ? "Interacted With (To)" : "Contract Created"}>
        {txData.to ? (
          <div className="flex items-baseline space-x-2 -ml-1">
            <AddressHighlighter address={txData.to}>
              <DecoratedAddressLink
                address={txData.to}
                miner={txData.to === txData.miner}
                txTo
              />
            </AddressHighlighter>
            <Copy value={txData.to} />
          </div>
        ) : (
          <div className="flex items-baseline space-x-2 -ml-1">
            <AddressHighlighter address={txData.createdContractAddress!}>
              <DecoratedAddressLink
                address={txData.createdContractAddress!}
                creation
                txTo
              />
            </AddressHighlighter>
            <Copy value={txData.createdContractAddress!} />
          </div>
        )}
        {internalOps && internalOps.length > 0 && (
          <div className="mt-2 space-y-1">
            {internalOps.map((op, i) => (
              <InternalTransactionOperation
                key={i}
                txData={txData}
                internalOp={op}
              />
            ))}
          </div>
        )}
      </InfoRow>
      <InfoRow title="Transaction Action">
        <MethodName data={txData.data} />
      </InfoRow>
      {txData.tokenTransfers.length > 0 && (
        <InfoRow title={`Tokens Transferred (${txData.tokenTransfers.length})`}>
          <div>
            {txData.tokenTransfers.map((t, i) => (
              <TokenTransferItem
                key={i}
                t={t}
                txData={txData}
                tokenMetas={txData.tokenMetas}
              />
            ))}
          </div>
        </InfoRow>
      )}
      <InfoRow title="Value">
        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
          {formatEther(txData.value)} Ether
        </span>
      </InfoRow>
      <InfoRow
        title={
          <>
            Type (
            <ExternalLink href="https://eips.ethereum.org/EIPS/eip-2718">
              EIP-2718
            </ExternalLink>
            )
          </>
        }
      >
        <TransactionType type={txData.type} />
      </InfoRow>
      {hasEIP1559 && (
        <InfoRow title="Block Base Fee">
          <UnitValue
            value={txData.blockBaseFeePerGas!}
            decimals={9}
            unit="Gwei"
            significantDecDigits={2}
          />{" "}
          (
          <UnitValue value={txData.blockBaseFeePerGas!} />)
        </InfoRow>
      )}
      {txData.type === 2 && (
        <>
          <InfoRow title="Max Priority Fee (Tip) Per Gas">
            <UnitValue
              value={txData.maxPriorityFeePerGas!}
              decimals={9}
              unit="Gwei"
              significantDecDigits={2}
            />{" "}
            (
            <UnitValue value={txData.maxPriorityFeePerGas!} />)
          </InfoRow>
          <InfoRow title="Max Fee Per Gas">
            <UnitValue
              value={txData.maxFeePerGas!}
              decimals={9}
              unit="Gwei"
              significantDecDigits={2}
            />{" "}
            (
            <UnitValue value={txData.maxFeePerGas!} />)
          </InfoRow>
        </>
      )}
      <InfoRow title="Gas Price">
        <div className="">
          <UnitValue
            value={txData.gasPrice!}
            decimals={9}
            unit="Gwei"
            significantDecDigits={2}
          />{" "}
          (<UnitValue value={txData.gasPrice!} />)
          {sendsEthToMiner && (
            <span className="rounded text-yellow-500 bg-yellow-100 text-xs px-2 py-1">
              Flashbots
            </span>
          )}
        </div>
      </InfoRow>
      <InfoRow title="Gas Used / Limit">
        <div className="flex space-x-3 items-baseline">
          <div>
            <RelativePosition
              pos={<GasValue value={txData.gasUsed} />}
              total={<GasValue value={txData.gasLimit} />}
            />
          </div>
          <div className="w-40 self-center">
            <PercentageBar
              perc={
                Math.round(
                  (txData.gasUsed.toNumber() / txData.gasLimit.toNumber()) *
                    10000
                ) / 100
              }
            />
          </div>
        </div>
      </InfoRow>
      <InfoRow title="Transaction Fee">
        <div className="space-y-3">
          <div>
            <UnitValue value={txData.fee} />
          </div>
          {hasEIP1559 && <RewardSplit txData={txData} />}
        </div>
      </InfoRow>
      <InfoRow title="Ether Price">N/A</InfoRow>
      <InfoRow title="Input Data">
        <div className="space-y-1">
          <div className="flex space-x-1">
            <button
              className={`border rounded-lg px-2 py-1 bg-gray-100 hover:bg-gray-200 hover:shadow text-xs text-gray-500 hover:text-gray-600 ${
                inputMode === 0 ? "border-blue-300" : ""
              }`}
              onClick={() => setInputMode(0)}
            >
              Raw
            </button>
            <button
              className={`border rounded-lg px-2 py-1 bg-gray-100 hover:bg-gray-200 hover:shadow text-xs text-gray-500 hover:text-gray-600 ${
                inputMode === 1 ? "border-blue-300" : ""
              }`}
              onClick={() => setInputMode(1)}
            >
              UTF-8
            </button>
          </div>
          <textarea
            className="w-full h-40 bg-gray-50 text-gray-500 font-mono focus:outline-none border rounded p-2"
            value={inputMode === 0 ? txData.data : utfInput}
            readOnly
          />
        </div>
      </InfoRow>
    </ContentFrame>
  );
};

export default React.memo(Details);
