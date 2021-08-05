import React from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCube,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
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
import FormattedBalance from "../components/FormattedBalance";
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
          {ethers.utils.formatEther(txData.value)} Ether
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
      {txData.type === 2 && (
        <>
          <InfoRow title="Max Priority Fee Per Gas">
            <span>
              <FormattedBalance value={txData.maxPriorityFeePerGas!} /> Ether (
              <FormattedBalance
                value={txData.maxPriorityFeePerGas!}
                decimals={9}
              />{" "}
              Gwei)
            </span>
          </InfoRow>
          <InfoRow title="Max Fee Per Gas">
            <span>
              <FormattedBalance value={txData.maxFeePerGas!} /> Ether (
              <FormattedBalance
                value={txData.maxFeePerGas!}
                decimals={9}
              />{" "}
              Gwei)
            </span>
          </InfoRow>
        </>
      )}
      <InfoRow title="Gas Price">
        <div className="flex items-baseline space-x-1">
          <span>
            <FormattedBalance value={txData.gasPrice} /> Ether (
            <FormattedBalance value={txData.gasPrice} decimals={9} /> Gwei)
          </span>
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
          <PercentageBar
            perc={
              Math.round(
                (txData.gasUsed.toNumber() / txData.gasLimit.toNumber()) * 10000
              ) / 100
            }
          />
        </div>
      </InfoRow>
      {hasEIP1559 && (
        <InfoRow title="Block Base Fee">
          <span>
            <FormattedBalance value={txData.blockBaseFeePerGas!} decimals={9} />{" "}
            Gwei (
            <FormattedBalance
              value={txData.blockBaseFeePerGas!}
              decimals={0}
            />{" "}
            wei)
          </span>
        </InfoRow>
      )}
      <InfoRow title="Transaction Fee">
        <div className="space-y-3">
          <div>
            <FormattedBalance value={txData.fee} /> Ether
          </div>
          {hasEIP1559 && <RewardSplit txData={txData} />}
        </div>
      </InfoRow>
      <InfoRow title="Ether Price">N/A</InfoRow>
      <InfoRow title="Input Data">
        <textarea
          className="w-full h-40 bg-gray-50 text-gray-500 font-mono focus:outline-none border rounded p-2"
          value={txData.data}
          readOnly
        />
      </InfoRow>
    </ContentFrame>
  );
};

export default React.memo(Details);
