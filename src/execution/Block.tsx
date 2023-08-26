import { useMemo, useContext, FC } from "react";
import { useParams, NavLink } from "react-router-dom";
import { formatUnits } from "ethers";
import { toUtf8String, Utf8ErrorFuncs } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn } from "@fortawesome/free-solid-svg-icons";
import StandardFrame from "../components/StandardFrame";
import StandardSubtitle from "../components/StandardSubtitle";
import NavBlock from "../components/NavBlock";
import ContentFrame from "../components/ContentFrame";
import BlockNotFound from "../components/BlockNotFound";
import InfoRow from "../components/InfoRow";
import Timestamp from "../components/Timestamp";
import BlockReward from "./components/BlockReward";
import RelativePosition from "../components/RelativePosition";
import PercentageBar from "../components/PercentageBar";
import BlockLink from "../components/BlockLink";
import DecoratedAddressLink from "./components/DecoratedAddressLink";
import NativeTokenAmount from "../components/NativeTokenAmount";
import FormattedBalance from "../components/FormattedBalance";
import NativeTokenPrice from "../components/NativeTokenPrice";
import HexValue from "../components/HexValue";
import { RuntimeContext } from "../useRuntime";
import { useLatestBlockNumber } from "../useLatestBlock";
import { blockTxsURL, blockURL } from "../url";
import { useBlockPageTitle } from "../useTitle";
import { useBlockData } from "../useErigonHooks";
import { useChainInfo } from "../useChainInfo";
import { commify } from "../utils/utils";

const Block: FC = () => {
  const { provider } = useContext(RuntimeContext);
  const { blockNumberOrHash } = useParams();
  if (blockNumberOrHash === undefined) {
    throw new Error("blockNumberOrHash couldn't be undefined here");
  }
  const {
    nativeCurrency: { name, symbol },
  } = useChainInfo();

  const { data: block, isLoading } = useBlockData(provider, blockNumberOrHash);
  useBlockPageTitle(parseInt(blockNumberOrHash));

  const extraStr = useMemo(() => {
    return block && toUtf8String(block.extraData, Utf8ErrorFuncs.replace);
  }, [block]);
  const burntFees = block?.baseFeePerGas && block.baseFeePerGas * block.gasUsed;
  const gasUsedPerc =
    block && Number((block.gasUsed * 10000n) / block.gasLimit) / 100;

  const latestBlockNumber = useLatestBlockNumber(provider);

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex items-baseline space-x-1">
          <span>Block</span>
          <span className="text-base text-gray-500">#{blockNumberOrHash}</span>
          {block && (
            <NavBlock
              entityNum={block.number}
              latestEntityNum={latestBlockNumber}
              urlBuilder={blockURL}
            />
          )}
        </div>
      </StandardSubtitle>
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
            <span className="font-bold">{commify(block.number)}</span>
          </InfoRow>
          <InfoRow title="Timestamp">
            <Timestamp value={block.timestamp} />
          </InfoRow>
          <InfoRow title="Transactions">
            <NavLink
              className="rounded-lg bg-link-blue/10 px-2 py-1 text-xs text-link-blue hover:bg-link-blue/100 hover:text-white"
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
            {commify(block.totalDifficulty.toString())}
          </InfoRow>
          <InfoRow title="Hash">
            <HexValue value={block.hash ?? "<unknown>"} />
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

export default Block;
