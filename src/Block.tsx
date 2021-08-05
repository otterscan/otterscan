import React, { useEffect, useMemo, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import { BigNumber, ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn } from "@fortawesome/free-solid-svg-icons";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import NavBlock from "./block/NavBlock";
import ContentFrame from "./ContentFrame";
import InfoRow from "./components/InfoRow";
import Timestamp from "./components/Timestamp";
import GasValue from "./components/GasValue";
import PercentageBar from "./components/PercentageBar";
import BlockLink from "./components/BlockLink";
import DecoratedAddressLink from "./components/DecoratedAddressLink";
import TransactionValue from "./components/TransactionValue";
import FormattedBalance from "./components/FormattedBalance";
import HexValue from "./components/HexValue";
import { RuntimeContext } from "./useRuntime";
import { useLatestBlockNumber } from "./useLatestBlock";
import { blockTxsURL } from "./url";
import { useBlockData } from "./useErigonHooks";

type BlockParams = {
  blockNumberOrHash: string;
};

const Block: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const params = useParams<BlockParams>();

  const block = useBlockData(provider, params.blockNumberOrHash);
  useEffect(() => {
    if (block) {
      document.title = `Block #${block.number} | Otterscan`;
    }
  }, [block]);

  const extraStr = useMemo(() => {
    try {
      return block && ethers.utils.toUtf8String(block.extraData);
    } catch (err) {
      console.error("Error while converting block extra data to string");
      console.error(err);
    }
  }, [block]);
  const burntFees =
    block?.baseFeePerGas && block.baseFeePerGas.mul(block.gasUsed);
  const netFeeReward = block && block.feeReward.sub(burntFees ?? 0);
  const gasUsedPerc =
    block && block.gasUsed.mul(10000).div(block.gasLimit).toNumber() / 100;

  const latestBlockNumber = useLatestBlockNumber(provider);

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex space-x-1 items-baseline">
          <span>Block</span>
          <span className="text-base text-gray-500">
            #{params.blockNumberOrHash}
          </span>
          {block && (
            <NavBlock
              blockNumber={block.number}
              latestBlockNumber={latestBlockNumber}
            />
          )}
        </div>
      </StandardSubtitle>
      {block && (
        <ContentFrame>
          <InfoRow title="Block Height">
            <span className="font-bold">
              {ethers.utils.commify(block.number)}
            </span>
          </InfoRow>
          <InfoRow title="Timestamp">
            <Timestamp value={block.timestamp} />
          </InfoRow>
          <InfoRow title="Transactions">
            <NavLink
              className="bg-link-blue bg-opacity-10 text-link-blue hover:bg-opacity-100 hover:text-white rounded-lg px-2 py-1 text-xs"
              to={blockTxsURL(block.number)}
            >
              {block.transactionCount} transactions
            </NavLink>{" "}
            in this block
          </InfoRow>
          <InfoRow title="Mined by">
            <DecoratedAddressLink address={block.miner} miner />
          </InfoRow>
          <InfoRow title="Block Reward">
            <TransactionValue
              value={block.blockReward.add(netFeeReward ?? 0)}
            />
            {!block.feeReward.isZero() && (
              <>
                {" "}
                (<TransactionValue value={block.blockReward} hideUnit /> +{" "}
                <TransactionValue
                  value={netFeeReward ?? BigNumber.from(0)}
                  hideUnit
                />
                )
              </>
            )}
          </InfoRow>
          <InfoRow title="Uncles Reward">
            <TransactionValue value={block.unclesReward} />
          </InfoRow>
          <InfoRow title="Size">
            {ethers.utils.commify(block.size)} bytes
          </InfoRow>
          {block.baseFeePerGas && (
            <InfoRow title="Base Fee">
              <span>
                <FormattedBalance value={block.baseFeePerGas} decimals={9} />{" "}
                Gwei (
                <FormattedBalance
                  value={block.baseFeePerGas}
                  decimals={0}
                />{" "}
                wei)
              </span>
            </InfoRow>
          )}
          {burntFees && (
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
                    Ether
                  </span>
                </span>
              </div>
            </InfoRow>
          )}
          <InfoRow title="Gas Used/Limit">
            <div className="flex space-x-3 items-baseline">
              <div>
                <GasValue value={block.gasUsed} /> /{" "}
                <GasValue value={block.gasLimit} />
              </div>
              <PercentageBar perc={gasUsedPerc!} />
            </div>
          </InfoRow>
          <InfoRow title="Extra Data">
            {extraStr} (Hex:{" "}
            <span className="font-data">{block.extraData}</span>)
          </InfoRow>
          <InfoRow title="Ether Price">N/A</InfoRow>
          <InfoRow title="Difficult">
            {ethers.utils.commify(block.difficulty)}
          </InfoRow>
          <InfoRow title="Total Difficult">
            {ethers.utils.commify(block.totalDifficulty.toString())}
          </InfoRow>
          <InfoRow title="Hash">
            <HexValue value={block.hash} />
          </InfoRow>
          <InfoRow title="Parent Hash">
            <BlockLink blockTag={block.parentHash} />
          </InfoRow>
          <InfoRow title="Sha3Uncles">
            <HexValue value={block.sha3Uncles} />
          </InfoRow>
          <InfoRow title="StateRoot">
            <HexValue value={block.stateRoot} />
          </InfoRow>
          <InfoRow title="Nonce">
            <span className="font-data">{block.nonce}</span>
          </InfoRow>
        </ContentFrame>
      )}
    </StandardFrame>
  );
};

export default React.memo(Block);
