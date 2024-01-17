import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import { formatUnits } from "ethers";
import { FC, memo, useContext, useState } from "react";
import BlockConfirmations from "../../components/BlockConfirmations";
import BlockLink from "../../components/BlockLink";
import ContentFrame from "../../components/ContentFrame";
import Copy from "../../components/Copy";
import ExpanderSwitch from "../../components/ExpanderSwitch";
import ExternalLink from "../../components/ExternalLink";
import { feePreset } from "../../components/FiatValue";
import FormattedBalance from "../../components/FormattedBalance";
import HelpButton from "../../components/HelpButton";
import InfoRow from "../../components/InfoRow";
import InternalTransactionOperation from "../../components/InternalTransactionOperation";
import MethodName from "../../components/MethodName";
import ModeTab from "../../components/ModeTab";
import NativeTokenAmountAndFiat from "../../components/NativeTokenAmountAndFiat";
import NativeTokenPrice from "../../components/NativeTokenPrice";
import NavBlock from "../../components/NavBlock";
import Nonce from "../../components/Nonce";
import PercentageBar from "../../components/PercentageBar";
import PercentagePosition from "../../components/PercentagePosition";
import RelativePosition from "../../components/RelativePosition";
import StandardTextarea from "../../components/StandardTextarea";
import Timestamp from "../../components/Timestamp";
import TransactionType from "../../components/TransactionType";
import {
  useError,
  useSourcifyMetadata,
  useTransactionDescription as useSourcifyTransactionDescription,
} from "../../sourcify/useSourcify";
import { TransactionData } from "../../types";
import { blockTxURL } from "../../url";
import {
  extract4Bytes,
  use4Bytes,
  useTransactionDescription,
} from "../../use4Bytes";
import { useChainInfo } from "../../useChainInfo";
import {
  useBlockDataFromTransaction,
  useSendsToMiner,
  useTokenTransfers,
  useTransactionError,
} from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { commify } from "../../utils/utils";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";
import NavNonce from "./NavNonce";
import RewardSplit from "./RewardSplit";
import TokenTransferItem from "./TokenTransferItem";
import DecodedParamsTable from "./decoder/DecodedParamsTable";
import InputDecoder from "./decoder/InputDecoder";

type DetailsProps = {
  txData: TransactionData;
};

const Details: FC<DetailsProps> = ({ txData }) => {
  const { provider } = useContext(RuntimeContext);
  const block = useBlockDataFromTransaction(provider, txData);

  const hasEIP1559 =
    block?.baseFeePerGas !== undefined && block?.baseFeePerGas !== null;

  const fourBytes =
    txData.to !== null ? extract4Bytes(txData.data) ?? "0x" : "0x";
  const fourBytesEntry = use4Bytes(fourBytes, txData.to ?? undefined);
  const fourBytesTxDesc = useTransactionDescription(
    fourBytesEntry,
    txData.data,
    txData.value,
  );

  const [sendsEthToMiner, internalOps] = useSendsToMiner(
    provider,
    txData.confirmedData ? txData.transactionHash : undefined,
    block?.miner,
  );

  const tokenTransfers = useTokenTransfers(txData);

  const match = useSourcifyMetadata(txData?.to, provider?._network.chainId);
  const metadata = match?.metadata;

  const txDesc = useSourcifyTransactionDescription(metadata, txData);
  const userDoc = metadata?.output.userdoc;
  const devDoc = metadata?.output.devdoc;
  const resolvedTxDesc = txDesc ?? fourBytesTxDesc;
  const userMethod = txDesc ? userDoc?.methods[txDesc.signature] : undefined;
  const devMethod = txDesc ? devDoc?.methods[txDesc.signature] : undefined;

  const {
    nativeCurrency: { name, symbol },
  } = useChainInfo();

  const [errorMsg, outputData, isCustomError] = useTransactionError(
    provider,
    txData.transactionHash,
  );
  const errorDescription = useError(
    metadata,
    isCustomError ? outputData : undefined,
  );
  const userError = errorDescription
    ? userDoc?.errors?.[errorDescription.signature]?.[0]
    : undefined;
  const devError = errorDescription
    ? devDoc?.errors?.[errorDescription.signature]?.[0]
    : undefined;
  const [expanded, setExpanded] = useState<boolean>(false);
  const [showFunctionHelp, setShowFunctionHelp] = useState<boolean>(false);

  return (
    <ContentFrame tabs>
      <InfoRow title="Transaction Hash">
        <div className="flex items-baseline space-x-2">
          <span className="font-hash" data-test="tx-hash">
            {txData.transactionHash}
          </span>
          <Copy value={txData.transactionHash} />
        </div>
      </InfoRow>
      <InfoRow title="Status">
        {txData.confirmedData === undefined ? (
          <span className="italic text-gray-400">Pending</span>
        ) : txData.confirmedData.status ? (
          <span className="flex w-min items-baseline space-x-1 rounded-lg bg-emerald-50 px-3 py-1 text-xs text-emerald-500">
            <FontAwesomeIcon
              className="self-center"
              icon={faCheckCircle}
              size="1x"
            />
            <span data-test="status">Success</span>
          </span>
        ) : (
          <>
            <div className="flex items-baseline space-x-1">
              <div className="flex items-baseline space-x-1 rounded-lg bg-red-50 px-3 py-1 text-xs text-red-500">
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
                <Tab.List className="mb-1 mt-2 flex space-x-1">
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
                        paramTypes={errorDescription.fragment.inputs}
                        hasParamNames
                        userMethod={userError}
                        devMethod={devError}
                      />
                    )}
                  </Tab.Panel>
                  <Tab.Panel>
                    <StandardTextarea value={outputData} />
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
              <div className="mr-3 flex items-baseline space-x-1">
                <BlockLink blockTag={txData.confirmedData.blockNumber} />
                <BlockConfirmations
                  confirmations={txData.confirmedData.confirmations}
                />
              </div>
              {block && (
                <div className="flex items-baseline space-x-2 pl-3">
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
                  <div>
                    <NavBlock
                      entityNum={txData.confirmedData.transactionIndex}
                      latestEntityNum={block.transactionCount - 1}
                      urlBuilder={(txIndex: number) =>
                        blockTxURL(txData.confirmedData!.blockNumber, txIndex)
                      }
                      showFirstLink
                    />
                  </div>
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
          <TransactionAddressWithCopy address={txData.from} />
          <div className="ml-3 flex items-baseline pl-3">
            <Nonce value={txData.nonce} />
            <NavNonce sender={txData.from} nonce={txData.nonce} />
          </div>
        </div>
      </InfoRow>
      <InfoRow title={txData.to ? "Interacted With (To)" : "Contract Created"}>
        {txData.to ? (
          <TransactionAddressWithCopy address={txData.to} showCodeIndicator />
        ) : txData.confirmedData === undefined ? (
          <span className="italic text-gray-400">
            Pending contract creation
          </span>
        ) : (
          <TransactionAddressWithCopy
            address={txData.confirmedData?.createdContractAddress!}
          />
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
          <div className="flex space-x-1">
            <MethodName data={txData.data} to={txData.to} />{" "}
            {(userMethod || devMethod) && (
              <HelpButton
                checked={showFunctionHelp}
                onChange={setShowFunctionHelp}
              />
            )}
          </div>
          {(userMethod || devMethod) && showFunctionHelp && (
            <div className="mt-1 text-gray-800">
              {userMethod && userMethod.notice && (
                <div className="col-span-12 gap-x-2 pt-1 px-1 font-normal">
                  {userMethod.notice}
                </div>
              )}
              {devMethod && devMethod.details && (
                <div className="col-span-12 gap-x-2 pt-1 px-1 font-normal">
                  <span className="font-bold italic text-xs mr-2 select-none">
                    dev{" "}
                  </span>
                  {devMethod.details}
                </div>
              )}
            </div>
          )}
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
        <NativeTokenAmountAndFiat
          value={txData.value}
          blockTag={txData.confirmedData?.blockNumber}
          {...feePreset}
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
            <FormattedBalance
              value={txData.maxPriorityFeePerGas!}
              symbol={symbol}
            />{" "}
            (
            <FormattedBalance
              value={txData.maxPriorityFeePerGas!}
              decimals={9}
              symbol="Gwei"
            />
            )
          </InfoRow>
          <InfoRow title="Max Fee Per Gas">
            <FormattedBalance value={txData.maxFeePerGas!} symbol={symbol} /> (
            <FormattedBalance
              value={txData.maxFeePerGas!}
              decimals={9}
              symbol="Gwei"
            />
            )
          </InfoRow>
        </>
      )}
      {txData.gasPrice !== undefined && (
        <InfoRow title="Gas Price">
          <div className="flex items-baseline space-x-1">
            <span>
              <FormattedBalance value={txData.gasPrice} symbol={symbol} /> (
              <FormattedBalance
                value={txData.gasPrice}
                decimals={9}
                symbol="Gwei"
              />
              )
            </span>
            {sendsEthToMiner && (
              <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-500">
                Flashbots
              </span>
            )}
          </div>
        </InfoRow>
      )}
      {txData.confirmedData && (
        <InfoRow title="Gas Used / Limit">
          <div className="flex items-baseline space-x-3">
            <div>
              <RelativePosition
                pos={commify(formatUnits(txData.confirmedData.gasUsed, 0))}
                total={commify(formatUnits(txData.gasLimit, 0))}
              />
            </div>
            <PercentageBar
              perc={
                Number(
                  (txData.confirmedData.gasUsed * 10000n) / txData.gasLimit,
                ) / 100
              }
            />
          </div>
        </InfoRow>
      )}
      {block && hasEIP1559 && (
        <InfoRow title="Block Base Fee">
          <FormattedBalance
            value={block.baseFeePerGas!}
            decimals={9}
            symbol="Gwei"
          />{" "}
          (
          <FormattedBalance
            value={block.baseFeePerGas!}
            decimals={0}
            symbol="wei"
          />
          )
        </InfoRow>
      )}
      {txData.confirmedData && (
        <>
          <InfoRow title="Transaction Fee">
            <div className="space-y-3">
              <div>
                <NativeTokenAmountAndFiat
                  value={txData.confirmedData.fee}
                  blockTag={txData.confirmedData.blockNumber}
                  {...feePreset}
                />
              </div>
              {hasEIP1559 && <RewardSplit txData={txData} />}
            </div>
          </InfoRow>
          <InfoRow title={`${name} Price`}>
            <NativeTokenPrice blockTag={txData.confirmedData.blockNumber} />
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

export default memo(Details);
