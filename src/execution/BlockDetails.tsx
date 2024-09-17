import { faBurn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Utf8ErrorFuncs, formatUnits, toUtf8String } from "ethers";
import { FC, useContext, useMemo } from "react";
import { NavLink } from "react-router-dom";
import BlockLink from "../components/BlockLink";
import BlockNotFound from "../components/BlockNotFound";
import ContentFrame from "../components/ContentFrame";
import ExternalBlockLink from "../components/ExternalBlockLink";
import FormattedBalance from "../components/FormattedBalance";
import HexValue from "../components/HexValue";
import InfoRow from "../components/InfoRow";
import NativeTokenAmount from "../components/NativeTokenAmount";
import NativeTokenPrice from "../components/NativeTokenPrice";
import PercentageBar from "../components/PercentageBar";
import RelativePosition from "../components/RelativePosition";
import Timestamp from "../components/Timestamp";
import SlotLink from "../consensus/components/SlotLink";
import { blockTxsURL } from "../url";
import { useChainInfo } from "../useChainInfo";
import { useBlockData, useL1Epoch } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";
import { useBlockPageTitle } from "../useTitle";
import { commify } from "../utils/utils";
import BlockReward from "./components/BlockReward";
import DecoratedAddressLink from "./components/DecoratedAddressLink";

interface BlockDetailsProps {
  blockNumberOrHash: undefined | string;
}

const BlockDetails: FC<BlockDetailsProps> = ({ blockNumberOrHash }) => {
  const { config, provider } = useContext(RuntimeContext);
  if (blockNumberOrHash === undefined) {
    throw new Error("blockNumberOrHash couldn't be undefined here");
  }
  const {
    nativeCurrency: { name, symbol },
  } = useChainInfo();

  const { data: block, isLoading } = useBlockData(provider, blockNumberOrHash);
  useBlockPageTitle(blockNumberOrHash);

  const extraStr = useMemo(() => {
    return block && toUtf8String(block.extraData, Utf8ErrorFuncs.replace);
  }, [block]);
  // gasUsedDepositTx: Optimism-specific; "gas used" by the deposit transaction which does
  // not pay the basefee
  const gasUsedWithoutDepositTx = block
    ? block.gasUsed - (block.gasUsedDepositTx ?? 0n)
    : 0n;
  const burntFees =
    block?.baseFeePerGas && block.baseFeePerGas * gasUsedWithoutDepositTx;
  const gasUsedPerc =
    block && Number((block.gasUsed * 10000n) / block.gasLimit) / 100;

  const l1Epoch = useL1Epoch(provider, block ? block.number : null);
  const l1ExplorerUrl: string | undefined =
    config.opChainSettings?.l1ExplorerURL;

  return (
    <>
      {block === null && (
        <BlockNotFound blockNumberOrHash={blockNumberOrHash} />
      )}
      {block === undefined && (
        <ContentFrame>
          <InfoRow title="Block Height">Loading block data...</InfoRow>
        </ContentFrame>
      )}
      {block && (
        <ContentFrame isLoading={isLoading}>
          <InfoRow title="Block Height">
            <span className="font-bold" data-test="block-height-text">
              {commify(block.number)}
            </span>
          </InfoRow>
          <InfoRow title="Timestamp">
            <Timestamp value={block.timestamp} />
          </InfoRow>
          <InfoRow title="Transactions">
            <NavLink
              className="rounded-lg bg-link-blue/10 px-2 py-1 text-xs text-link-blue hover:bg-link-blue/100 hover:text-white"
              to={blockTxsURL(block.number)}
            >
              {block.transactionCount} transaction
              {block.transactionCount !== 1 ? "s" : ""}
            </NavLink>{" "}
            in this block
          </InfoRow>
          <InfoRow title="Mined by">
            <DecoratedAddressLink address={block.miner} miner />
          </InfoRow>
          <InfoRow title="Block Reward">
            <BlockReward block={block} />
          </InfoRow>
          <InfoRow title="Uncles Reward">
            <NativeTokenAmount value={block.unclesReward} />
          </InfoRow>
          <InfoRow title="Size">{commify(block.size)} bytes</InfoRow>
          {block.baseFeePerGas !== null &&
            block.baseFeePerGas !== undefined && (
              <InfoRow title="Base Fee">
                <span>
                  <FormattedBalance
                    value={block.baseFeePerGas}
                    decimals={9}
                    symbol="Gwei"
                  />{" "}
                  (
                  <FormattedBalance
                    value={block.baseFeePerGas}
                    decimals={0}
                    symbol="wei"
                  />
                  )
                </span>
              </InfoRow>
            )}
          {burntFees !== null && burntFees !== undefined && (
            <InfoRow title="Burnt Fees">
              <div className="flex items-baseline space-x-1">
                <span className="flex space-x-1 text-orange-500">
                  <span title="Burnt fees">
                    <FontAwesomeIcon icon={faBurn} size="1x" />
                  </span>
                  <span>
                    <span className="line-through">
                      <FormattedBalance value={burntFees} />
                    </span>{" "}
                    {symbol}
                  </span>
                </span>
              </div>
            </InfoRow>
          )}
          <InfoRow title="Gas Used/Limit">
            <div className="flex items-baseline space-x-3">
              <div>
                <RelativePosition
                  pos={commify(formatUnits(block.gasUsed, 0))}
                  total={commify(formatUnits(block.gasLimit, 0))}
                />
              </div>
              <PercentageBar perc={gasUsedPerc!} />
            </div>
          </InfoRow>
          {block.blobGasUsed !== null && block.blobGasUsed !== undefined && (
            <InfoRow title="Blob Gas Used">
              {commify(block.blobGasUsed)}
            </InfoRow>
          )}
          {block.excessBlobGas !== null &&
            block.excessBlobGas !== undefined && (
              <InfoRow title="Excess Blob Gas">
                {commify(block.excessBlobGas)}
              </InfoRow>
            )}
          <InfoRow title="Extra Data">
            {extraStr} (Hex:{" "}
            <span className="break-all font-data">{block.extraData}</span>)
          </InfoRow>
          <InfoRow title={`${name} Price`}>
            <NativeTokenPrice blockTag={block.number} />
          </InfoRow>
          <InfoRow title="Difficulty">
            {commify(block.difficulty.toString())}
          </InfoRow>
          <InfoRow title="Total Difficulty">
            {block.totalDifficulty !== undefined
              ? commify(block.totalDifficulty.toString())
              : "N/A"}
          </InfoRow>
          <InfoRow title="Hash">
            <HexValue value={block.hash ?? "<unknown>"} />
          </InfoRow>
          <InfoRow title="Parent Hash">
            <BlockLink blockTag={block.parentHash} />
          </InfoRow>
          {block.parentBeaconBlockRoot && (
            <InfoRow title="Parent Beacon Block Root">
              {config?.beaconAPI === undefined ? (
                <HexValue value={block.parentBeaconBlockRoot} />
              ) : (
                <SlotLink slot={block.parentBeaconBlockRoot} />
              )}
            </InfoRow>
          )}
          {l1Epoch !== undefined && l1Epoch !== null && (
            <InfoRow title="L1 Epoch">
              <ExternalBlockLink
                blockTag={l1Epoch}
                explorerUrl={l1ExplorerUrl}
              />
            </InfoRow>
          )}
          <InfoRow title="Sha3Uncles">
            <HexValue value={block.sha3Uncles} />
          </InfoRow>
          <InfoRow title="State Root">
            <HexValue value={block.stateRoot} />
          </InfoRow>
          {block.receiptsRoot !== null && block.receiptsRoot !== undefined && (
            <InfoRow title="Receipts Root">
              <HexValue value={block.receiptsRoot} />
            </InfoRow>
          )}
          <InfoRow title="Nonce">
            <span className="font-data">{block.nonce}</span>
          </InfoRow>
        </ContentFrame>
      )}
    </>
  );
};

export default BlockDetails;
