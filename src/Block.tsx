import React, { useEffect, useState, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import { ethers, BigNumber } from "ethers";
import { provider } from "./ethersconfig";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import ContentFrame from "./ContentFrame";
import Timestamp from "./components/Timestamp";
import GasValue from "./components/GasValue";
import BlockLink from "./components/BlockLink";
import AddressLink from "./components/AddressLink";
import TransactionValue from "./components/TransactionValue";

type BlockParams = {
  blockNumberOrHash: string;
};

interface ExtendedBlock extends ethers.providers.Block {
  blockReward: BigNumber;
  unclesReward: BigNumber;
  feeReward: BigNumber;
  size: number;
  sha3Uncles: string;
  stateRoot: string;
  totalDifficulty: BigNumber;
}

const Block: React.FC = () => {
  const params = useParams<BlockParams>();

  const [block, setBlock] = useState<ExtendedBlock>();
  useEffect(() => {
    const readBlock = async () => {
      let blockPromise: Promise<any>;
      if (ethers.utils.isHexString(params.blockNumberOrHash, 32)) {
        blockPromise = provider.send("eth_getBlockByHash", [
          params.blockNumberOrHash,
          false,
        ]);
      } else {
        blockPromise = provider.send("eth_getBlockByNumber", [
          params.blockNumberOrHash,
          false,
        ]);
      }
      const [_rawBlock, _rawIssuance, _rawReceipts] = await Promise.all([
        blockPromise,
        provider.send("erigon_issuance", [params.blockNumberOrHash]),
        provider.send("eth_getBlockReceipts", [params.blockNumberOrHash]),
      ]);
      const receipts = (_rawReceipts as any[]).map((r) =>
        provider.formatter.receipt(r)
      );
      const fees = receipts.reduce(
        (acc, r) => acc.add(r.effectiveGasPrice.mul(r.gasUsed)),
        BigNumber.from(0)
      );

      const _block = provider.formatter.block(_rawBlock);
      const extBlock: ExtendedBlock = {
        blockReward: provider.formatter.bigNumber(_rawIssuance.blockReward),
        unclesReward: provider.formatter.bigNumber(_rawIssuance.uncleReward),
        feeReward: fees,
        size: provider.formatter.number(_rawBlock.size),
        sha3Uncles: _rawBlock.sha3Uncles,
        stateRoot: _rawBlock.stateRoot,
        totalDifficulty: provider.formatter.bigNumber(
          _rawBlock.totalDifficulty
        ),
        ..._block,
      };
      setBlock(extBlock);
    };
    readBlock();
  }, [params.blockNumberOrHash]);

  useEffect(() => {
    if (block) {
      document.title = `Block #${block.number} | Otterscan`;
    }
  }, [block]);

  const extraStr = useMemo(() => {
    try {
      return block && ethers.utils.toUtf8String(block.extraData);
    } catch (err) {
      console.error(err);
    }
  }, [block]);

  return (
    <StandardFrame>
      <StandardSubtitle>
        Block{" "}
        <span className="text-base text-gray-500">
          #{params.blockNumberOrHash}
        </span>
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
              to={`/block/${block.number}/txs`}
            >
              {block.transactions.length} transactions
            </NavLink>{" "}
            in this block
          </InfoRow>
          <InfoRow title="Mined by">
            <div className="flex">
              <AddressLink address={block.miner} />
            </div>
          </InfoRow>
          <InfoRow title="Block Reward">
            <TransactionValue value={block.blockReward.add(block.feeReward)} />
            {!block.feeReward.isZero() && (
              <>
                {" "}
                (<TransactionValue value={block.blockReward} hideUnit /> +{" "}
                <TransactionValue value={block.feeReward} hideUnit />)
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
            <span className="font-hash">{block.hash}</span>
          </InfoRow>
          <InfoRow title="Parent Hash">
            <BlockLink blockTag={block.parentHash} />
          </InfoRow>
          <InfoRow title="Sha3Uncles">
            <span className="font-hash">{block.sha3Uncles}</span>
          </InfoRow>
          <InfoRow title="StateRoot">
            <span className="font-hash">{block.stateRoot}</span>
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
