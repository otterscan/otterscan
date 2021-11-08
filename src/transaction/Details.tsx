import React, { useMemo } from "react";
import {
  TransactionDescription,
  Fragment,
  Interface,
} from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faCube } from "@fortawesome/free-solid-svg-icons/faCube";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import BlockLink from "../components/BlockLink";
import BlockConfirmations from "../components/BlockConfirmations";
import TransactionAddress from "../components/TransactionAddress";
import Copy from "../components/Copy";
import Nonce from "../components/Nonce";
import Timestamp from "../components/Timestamp";
import InternalTransactionOperation from "../components/InternalTransactionOperation";
import MethodName from "../components/MethodName";
import TransactionType from "../components/TransactionType";
import RewardSplit from "./RewardSplit";
import GasValue from "../components/GasValue";
import USDValue from "../components/USDValue";
import FormattedBalance from "../components/FormattedBalance";
import ETH2USDValue from "../components/ETH2USDValue";
import TokenTransferItem from "../TokenTransferItem";
import { TransactionData, InternalOperation } from "../types";
import PercentageBar from "../components/PercentageBar";
import ExternalLink from "../components/ExternalLink";
import RelativePosition from "../components/RelativePosition";
import PercentagePosition from "../components/PercentagePosition";
import InputDecoder from "./decoder/InputDecoder";
import { rawInputTo4Bytes, use4Bytes } from "../use4Bytes";
import { DevDoc, UserDoc } from "../useSourcify";
import { ResolvedAddresses } from "../api/address-resolver";

type DetailsProps = {
  txData: TransactionData;
  txDesc: TransactionDescription | null | undefined;
  userDoc?: UserDoc | undefined;
  devDoc?: DevDoc | undefined;
  internalOps?: InternalOperation[];
  sendsEthToMiner: boolean;
  ethUSDPrice: BigNumber | undefined;
  resolvedAddresses: ResolvedAddresses | undefined;
};

const Details: React.FC<DetailsProps> = ({
  txData,
  txDesc,
  userDoc,
  devDoc,
  internalOps,
  sendsEthToMiner,
  ethUSDPrice,
  resolvedAddresses,
}) => {
  const hasEIP1559 =
    txData.confirmedData?.blockBaseFeePerGas !== undefined &&
    txData.confirmedData?.blockBaseFeePerGas !== null;

  const fourBytes = txData.to !== null ? rawInputTo4Bytes(txData.data) : "0x";
  const fourBytesEntry = use4Bytes(fourBytes);
  const fourBytesTxDesc = useMemo(() => {
    if (!fourBytesEntry) {
      return fourBytesEntry;
    }
    if (!txData || !fourBytesEntry.signature) {
      return undefined;
    }
    const sig = fourBytesEntry?.signature;
    const functionFragment = Fragment.fromString(`function ${sig}`);
    const intf = new Interface([functionFragment]);
    return intf.parseTransaction({ data: txData.data, value: txData.value });
  }, [txData, fourBytesEntry]);

  const resolvedTxDesc = txDesc ?? fourBytesTxDesc;
  const userMethod = txDesc ? userDoc?.methods[txDesc.signature] : undefined;
  const devMethod = txDesc ? devDoc?.methods[txDesc.signature] : undefined;

  return (
    <ContentFrame tabs>
      <InfoRow title="Transaction Hash">
        <div className="flex items-baseline space-x-2">
          <span className="font-hash">{txData.transactionHash}</span>
          <Copy value={txData.transactionHash} />
        </div>
      </InfoRow>
      <InfoRow title="Status">
        {txData.confirmedData === undefined ? (
          <span className="italic text-gray-400">Pending</span>
        ) : txData.confirmedData.status ? (
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
      {txData.confirmedData && (
        <>
          <InfoRow title="Block / Position">
            <div className="flex items-baseline divide-x-2 divide-dotted divide-gray-300">
              <div className="flex space-x-1 items-baseline mr-3">
                <span className="text-orange-500">
                  <FontAwesomeIcon icon={faCube} />
                </span>
                <BlockLink blockTag={txData.confirmedData.blockNumber} />
                <BlockConfirmations
                  confirmations={txData.confirmedData.confirmations}
                />
              </div>
              <div className="flex space-x-2 items-baseline pl-3">
                <RelativePosition
                  pos={txData.confirmedData.transactionIndex}
                  total={txData.confirmedData.blockTransactionCount - 1}
                />
                <PercentagePosition
                  perc={
                    txData.confirmedData.transactionIndex /
                    (txData.confirmedData.blockTransactionCount - 1)
                  }
                />
              </div>
            </div>
          </InfoRow>
          <InfoRow title="Timestamp">
            <Timestamp value={txData.confirmedData.timestamp} />
          </InfoRow>
        </>
      )}
      <InfoRow title="From / Nonce">
        <div className="flex divide-x-2 divide-dotted divide-gray-300">
          <div className="flex items-baseline space-x-2 -ml-1 mr-3">
            <TransactionAddress
              address={txData.from}
              resolvedAddresses={resolvedAddresses}
            />
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
            <TransactionAddress
              address={txData.to}
              resolvedAddresses={resolvedAddresses}
            />
            <Copy value={txData.to} />
          </div>
        ) : txData.confirmedData === undefined ? (
          <span className="italic text-gray-400">
            Pending contract creation
          </span>
        ) : (
          <div className="flex items-baseline space-x-2 -ml-1">
            <TransactionAddress
              address={txData.confirmedData?.createdContractAddress!}
              resolvedAddresses={resolvedAddresses}
            />
            <Copy value={txData.confirmedData.createdContractAddress!} />
          </div>
        )}
        {internalOps && internalOps.length > 0 && (
          <div className="mt-2 space-y-1">
            {internalOps.map((op, i) => (
              <InternalTransactionOperation
                key={i}
                txData={txData}
                internalOp={op}
                resolvedAddresses={resolvedAddresses}
              />
            ))}
          </div>
        )}
      </InfoRow>
      {txData.to && (
        <InfoRow title="Transaction Action">
          <MethodName data={txData.data} />
        </InfoRow>
      )}
      {txData.tokenTransfers.length > 0 && (
        <InfoRow title={`Tokens Transferred (${txData.tokenTransfers.length})`}>
          <div>
            {txData.tokenTransfers.map((t, i) => (
              <TokenTransferItem
                key={i}
                t={t}
                txData={txData}
                tokenMeta={txData.tokenMetas[t.token]}
                resolvedAddresses={resolvedAddresses}
              />
            ))}
          </div>
        </InfoRow>
      )}
      <InfoRow title="Value">
        <FormattedBalance value={txData.value} /> Ether{" "}
        {!txData.value.isZero() && ethUSDPrice && (
          <span className="px-2 border-skin-from border rounded-lg bg-skin-from text-skin-from">
            <ETH2USDValue ethAmount={txData.value} eth2USDValue={ethUSDPrice} />
          </span>
        )}
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
      {txData.gasPrice && (
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
      )}
      {txData.confirmedData && (
        <InfoRow title="Gas Used / Limit">
          <div className="flex space-x-3 items-baseline">
            <div>
              <RelativePosition
                pos={<GasValue value={txData.confirmedData.gasUsed} />}
                total={<GasValue value={txData.gasLimit} />}
              />
            </div>
            <PercentageBar
              perc={
                Math.round(
                  (txData.confirmedData.gasUsed.toNumber() /
                    txData.gasLimit.toNumber()) *
                    10000
                ) / 100
              }
            />
          </div>
        </InfoRow>
      )}
      {txData.confirmedData && hasEIP1559 && (
        <InfoRow title="Block Base Fee">
          <span>
            <FormattedBalance
              value={txData.confirmedData.blockBaseFeePerGas!}
              decimals={9}
            />{" "}
            Gwei (
            <FormattedBalance
              value={txData.confirmedData.blockBaseFeePerGas!}
              decimals={0}
            />{" "}
            wei)
          </span>
        </InfoRow>
      )}
      {txData.confirmedData && (
        <>
          <InfoRow title="Transaction Fee">
            <div className="space-y-3">
              <div>
                <FormattedBalance value={txData.confirmedData.fee} /> Ether{" "}
                {ethUSDPrice && (
                  <span className="px-2 border-skin-from border rounded-lg bg-skin-from text-skin-from">
                    <ETH2USDValue
                      ethAmount={txData.confirmedData.fee}
                      eth2USDValue={ethUSDPrice}
                    />
                  </span>
                )}
              </div>
              {hasEIP1559 && <RewardSplit txData={txData} />}
            </div>
          </InfoRow>
          <InfoRow title="Ether Price">
            <USDValue value={ethUSDPrice} />
          </InfoRow>
        </>
      )}
      <InfoRow title="Input Data">
        <InputDecoder
          fourBytes={fourBytes}
          resolvedTxDesc={resolvedTxDesc}
          hasParamNames={resolvedTxDesc === txDesc}
          data={txData.data}
          userMethod={userMethod}
          devMethod={devMethod}
          resolvedAddresses={resolvedAddresses}
        />
      </InfoRow>
    </ContentFrame>
  );
};

export default React.memo(Details);
