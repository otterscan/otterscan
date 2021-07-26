import React, { useEffect, useMemo, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import { BigNumber, ethers } from "ethers";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import NavBlock from "./block/NavBlock";
import ContentFrame from "./ContentFrame";
import Timestamp from "./components/Timestamp";
import GasValue from "./components/GasValue";
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
  const burnedFees =
    block?.baseFeePerGas && block.baseFeePerGas.mul(block.gasUsed);
  const netFeeReward = block && block.feeReward.sub(burnedFees ?? 0);

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
              {block.transactions.length} transactions
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
          <InfoRow title="Difficult">
            {ethers.utils.commify(block.difficulty)}
          </InfoRow>
          <InfoRow title="Total Difficult">
            {ethers.utils.commify(block.totalDifficulty.toString())}
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
          {burnedFees && (
            <InfoRow title="Burned Fees">
              <FormattedBalance value={burnedFees} /> Ether
            </InfoRow>
          )}
          <InfoRow title="Gas Used">
            <GasValue value={block.gasUsed} />
          </InfoRow>
          <InfoRow title="Gas Limit">
            <GasValue value={block.gasLimit} />
          </InfoRow>
          <InfoRow title="Extra Data">
            {extraStr} (Hex:{" "}
            <span className="font-data">{block.extraData}</span>)
          </InfoRow>
          <InfoRow title="Ether Price">N/A</InfoRow>
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

type InfoRowProps = {
  title: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ title, children }) => (
  <div className="grid grid-cols-4 py-4 text-sm">
    <div>{title}:</div>
    <div className="col-span-3">{children}</div>
  </div>
);

export default React.memo(Block);
