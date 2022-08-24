import React, { useContext, useState } from "react";
import { Tab } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faCube } from "@fortawesome/free-solid-svg-icons/faCube";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import ContentFrame from "../ContentFrame";
import InfoRow from "../components/InfoRow";
import BlockLink from "../components/BlockLink";
import ModeTab from "../components/ModeTab";
import ExpanderSwitch from "../components/ExpanderSwitch";
import BlockConfirmations from "../components/BlockConfirmations";
import TransactionAddress from "../components/TransactionAddress";
import Copy from "../components/Copy";
import Nonce from "../components/Nonce";
import NavNonce from "./NavNonce";
import Timestamp from "../components/Timestamp";
import InternalTransactionOperation from "../components/InternalTransactionOperation";
import MethodName from "../components/MethodName";
import TransactionDetailsValue from "../components/TransactionDetailsValue";
import TransactionType from "../components/TransactionType";
import TransactionFee from "./TransactionFee";
import RewardSplit from "./RewardSplit";
import GasValue from "../components/GasValue";
import USDValue from "../components/USDValue";
import FormattedBalance from "../components/FormattedBalance";
import TokenTransferItem from "../TokenTransferItem";
import { TransactionData } from "../types";
import PercentageBar from "../components/PercentageBar";
import ExternalLink from "../components/ExternalLink";
import RelativePosition from "../components/RelativePosition";
import PercentagePosition from "../components/PercentagePosition";
import DecodedParamsTable from "./decoder/DecodedParamsTable";
import InputDecoder from "./decoder/InputDecoder";
import {
  extract4Bytes,
  use4Bytes,
  useTransactionDescription,
} from "../use4Bytes";
import {
  useError,
  useSourcifyMetadata,
  useTransactionDescription as useSourcifyTransactionDescription,
} from "../sourcify/useSourcify";
import { RuntimeContext } from "../useRuntime";
import {
  useBlockDataFromTransaction,
  useSendsToMiner,
  useTokenTransfers,
  useTransactionError,
} from "../useErigonHooks";
import { useChainInfo } from "../useChainInfo";
import { useETHUSDOracle } from "../usePriceOracle";

type DetailsProps = {
  txData: TransactionData;
};

const Details: React.FC<DetailsProps> = ({ txData }) => {
  const { provider } = useContext(RuntimeContext);
  const block = useBlockDataFromTransaction(provider, txData);

  const hasEIP1559 =
    block?.baseFeePerGas !== undefined && block?.baseFeePerGas !== null;

  const fourBytes =
    txData.to !== null ? extract4Bytes(txData.data) ?? "0x" : "0x";
  const fourBytesEntry = use4Bytes(fourBytes);
  const fourBytesTxDesc = useTransactionDescription(
    fourBytesEntry,
    txData.data,
    txData.value
  );

  const [sendsEthToMiner, internalOps] = useSendsToMiner(
    provider,
    txData.confirmedData ? txData.transactionHash : undefined,
    block?.miner
  );

  const tokenTransfers = useTokenTransfers(txData);

  const metadata = useSourcifyMetadata(txData?.to, provider?.network.chainId);

  const txDesc = useSourcifyTransactionDescription(metadata, txData);
  const userDoc = metadata?.output.userdoc;
  const devDoc = metadata?.output.devdoc;
  const resolvedTxDesc = txDesc ?? fourBytesTxDesc;
  const userMethod = txDesc ? userDoc?.methods[txDesc.signature] : undefined;
  const devMethod = txDesc ? devDoc?.methods[txDesc.signature] : undefined;

  const {
    nativeCurrency: { name, symbol },
  } = useChainInfo();

  const blockETHUSDPrice = useETHUSDOracle(
    provider,
    txData?.confirmedData?.blockNumber
  );

  const [errorMsg, outputData, isCustomError] = useTransactionError(
    provider,
    txData.transactionHash
  );
  const errorDescription = useError(
    metadata,
    isCustomError ? outputData : undefined
  );
  const userError = errorDescription
    ? userDoc?.errors?.[errorDescription.signature]?.[0]
    : undefined;
  const devError = errorDescription
    ? devDoc?.errors?.[errorDescription.signature]?.[0]
    : undefined;
  const [expanded, setExpanded] = useState<boolean>(false);

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
          <span className="flex items-baseline w-min rounded-lg space-x-1 px-3 py-1 bg-emerald-50 text-emerald-500 text-xs">
            <FontAwesomeIcon
              className="self-center"
              icon={faCheckCircle}
              size="1x"
            />
            <span>Success</span>
          </span>
        ) : (
          <>
            <div className="flex space-x-1 items-baseline">
              <div className="flex items-baseline rounded-lg space-x-1 px-3 py-1 bg-red-50 text-red-500 text-xs">
                <FontAwesomeIcon
                  className="self-center"
                  icon={faTimesCircle}
                  size="1x"
                />
                <span>
                  Fail
                  {errorMsg && (
                    <>
                      {" "}
                      with revert message: '
                      <span className="font-bold underline">{errorMsg}</span>'
                    </>
                  )}
                  {isCustomError && (
                    <>
                      {" "}
                      with custom error
                      {errorDescription && (
                        <>
                          {" '"}
                          <span className="font-code font-bold underline">
                            {errorDescription.name}
                          </span>
                          {"'"}
                        </>
                      )}
                    </>
                  )}
                </span>
              </div>
              {isCustomError && (
                <ExpanderSwitch expanded={expanded} setExpanded={setExpanded} />
              )}
            </div>
            {expanded && (
              <Tab.Group>
                <Tab.List className="flex space-x-1 mt-2 mb-1">
                  <ModeTab disabled={!errorDescription}>Decoded</ModeTab>
                  <ModeTab>Raw</ModeTab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    {errorDescription === undefined ? (
                      <>Waiting for data...</>
                    ) : errorDescription === null ? (
                      <>Can't decode data</>
                    ) : errorDescription.args.length === 0 ? (
                      <>No parameters</>
                    ) : (
                      <DecodedParamsTable
                        args={errorDescription.args}
                        paramTypes={errorDescription.errorFragment.inputs}
                        hasParamNames
                        userMethod={userError}
                        devMethod={devError}
                      />
                    )}
                  </Tab.Panel>
                  <Tab.Panel>
                    <textarea
                      className="w-full h-40 bg-gray-50 text-gray-500 font-mono focus:outline-none border rounded p-2"
                      value={outputData}
                      readOnly
                    />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            )}
          </>
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
              {block && (
                <div className="flex space-x-2 items-baseline pl-3">
                  <RelativePosition
                    pos={txData.confirmedData.transactionIndex}
                    total={block.transactionCount - 1}
                  />
                  <PercentagePosition
                    perc={
                      txData.confirmedData.transactionIndex /
                      (block.transactionCount - 1)
                    }
                  />
                </div>
              )}
            </div>
          </InfoRow>
          <InfoRow title="Timestamp">
            {block && <Timestamp value={block.timestamp} />}
          </InfoRow>
        </>
      )}
      <InfoRow title="From / Nonce">
        <div className="flex divide-x-2 divide-dotted divide-gray-300">
          <div className="flex items-baseline space-x-2 -ml-1 mr-3">
            <TransactionAddress address={txData.from} />
            <Copy value={txData.from} />
          </div>
          <div className="flex items-baseline pl-3">
            <Nonce value={txData.nonce} />
            <NavNonce sender={txData.from} nonce={txData.nonce} />
          </div>
        </div>
      </InfoRow>
      <InfoRow title={txData.to ? "Interacted With (To)" : "Contract Created"}>
        {txData.to ? (
          <div className="flex items-baseline space-x-2 -ml-1">
            <TransactionAddress address={txData.to} showCodeIndicator />
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
            />
            <Copy value={txData.confirmedData.createdContractAddress!} />
          </div>
        )}
        {internalOps && internalOps.length > 0 && (
          <div className="mt-2 space-y-1 overflow-x-auto">
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
      {txData.to && (
        <InfoRow title="Transaction Action">
          <MethodName data={txData.data} />
        </InfoRow>
      )}
      {tokenTransfers && tokenTransfers.length > 0 && (
        <InfoRow title={`Tokens Transferred (${tokenTransfers.length})`}>
          {tokenTransfers.map((t, i) => (
            <TokenTransferItem key={i} t={t} />
          ))}
        </InfoRow>
      )}
      <InfoRow title="Value">
        <TransactionDetailsValue
          blockTag={txData.confirmedData?.blockNumber}
          value={txData.value}
        />
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
            <FormattedBalance value={txData.maxPriorityFeePerGas!} /> {symbol} (
            <FormattedBalance
              value={txData.maxPriorityFeePerGas!}
              decimals={9}
            />{" "}
            Gwei)
          </InfoRow>
          <InfoRow title="Max Fee Per Gas">
            <FormattedBalance value={txData.maxFeePerGas!} /> {symbol} (
            <FormattedBalance value={txData.maxFeePerGas!} decimals={9} /> Gwei)
          </InfoRow>
        </>
      )}
      {txData.gasPrice && (
        <InfoRow title="Gas Price">
          <div className="flex items-baseline space-x-1">
            <span>
              <FormattedBalance value={txData.gasPrice} /> {symbol} (
              <FormattedBalance value={txData.gasPrice} decimals={9} /> Gwei)
            </span>
            {sendsEthToMiner && (
              <span className="rounded text-amber-500 bg-amber-100 text-xs px-2 py-1">
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
      {block && hasEIP1559 && (
        <InfoRow title="Block Base Fee">
          <FormattedBalance value={block.baseFeePerGas!} decimals={9} /> Gwei (
          <FormattedBalance value={block.baseFeePerGas!} decimals={0} /> wei)
        </InfoRow>
      )}
      {txData.confirmedData && (
        <>
          <InfoRow title="Transaction Fee">
            <div className="space-y-3">
              <div>
                <TransactionFee confirmedData={txData.confirmedData} />
              </div>
              {hasEIP1559 && <RewardSplit txData={txData} />}
            </div>
          </InfoRow>
          <InfoRow title={`${name} Price`}>
            <USDValue value={blockETHUSDPrice} />
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
        />
      </InfoRow>
    </ContentFrame>
  );
};

export default React.memo(Details);
