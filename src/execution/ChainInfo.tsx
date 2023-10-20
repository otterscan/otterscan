import { FC, useContext, memo } from "react";
import ContentFrame from "../components/ContentFrame";
import { RuntimeContext } from "../useRuntime";
import ChainInfoItem from "../components/ChainInfoItem";
import { PendingChainInfoResults } from "../search/PendingResults";
import ChainInfoHeader from "../components/ChainInfoHeader";
import { useBCInfoStateInfo, useLatestBlockChainInfo } from "../useLatestBlock";
import BCInfoToolTip from "../components/BCInfoToolTip";
import BlockLink from "../components/BlockLink";

const ChainInfo: FC = () => {
  const { zilliqa } = useContext(RuntimeContext);

  const latestBlockChainInfo = useLatestBlockChainInfo(zilliqa); 
  
  const BCInfo = useBCInfoStateInfo(latestBlockChainInfo);

  // Return a table with rows containing the basic information of the most recent RECENT_SIZE blocks
  return (
    <ContentFrame isLoading={latestBlockChainInfo === undefined}>
      <div className="pb-3">
      <ChainInfoHeader isLoading={ latestBlockChainInfo  === undefined }/>
      {latestBlockChainInfo ?
        <div className="grid grid-rows-3 grid-cols-4 items-baseline gap-x-1 border-t 
        border-b border-gray-200 bg-gray-100 text-sm">
        <span>
          <ChainInfoItem title="Current Tx Epoch:" data={latestBlockChainInfo.NumTxBlocks} />
        </span>
        <span>
          <ChainInfoItem title="Number of Transactions:" data={latestBlockChainInfo.NumTransactions} />
        </span>
        <span>
          <ChainInfoItem title="Peers:" data={latestBlockChainInfo.NumPeers} />
        </span>
        <span>
          <ChainInfoItem title="Sharding Structure:" data={`[${latestBlockChainInfo.ShardingStructure.NumPeers.toString()}]`} />
        </span>
        <span>
          <ChainInfoItem title="Current DS Epoch:" data={latestBlockChainInfo.CurrentDSEpoch} />
        </span>
        <span>
          <ChainInfoItem title="DS Block Rate:" data={latestBlockChainInfo.DSBlockRate.toFixed(5)} />
        </span>
        <span>
          <ChainInfoItem title="Tx Block Rate:" data={latestBlockChainInfo.TxBlockRate.toFixed(5)} />
        </span>
        <span>
          <ChainInfoItem title="TPS:" data={latestBlockChainInfo.TransactionRate.toFixed(5)} />
        </span>
        <span>
          <ChainInfoItem title="Number of Txns in DS Epoch:" data={latestBlockChainInfo.NumTxnsDSEpoch} />
        </span>
        <span>
          <ChainInfoItem title="Number of Txns in Txn Epoch:" data={latestBlockChainInfo.NumTxnsTxEpoch} />
        </span>
        <span>
          <ChainInfoItem title={
          <span>
          <BCInfoToolTip child={`This statistic is accurate from TxBlock ${BCInfo?.startTxBlock}. Requires user to stay on the Home Page`}/>
          {' '}
          Recent Max Observed TPS: 
          </span>} 
          data={
            <span>
              {BCInfo?.maxTPS.toFixed(5)} 
              {' '}
              {BCInfo?.startTxBlock && <span className="text-xs">
                <span className="text-gray-500">
                  (on TxBlock  
                  {' '}
                  <BlockLink blockTag={BCInfo?.startTxBlock} />
                  ) 
                </span>
              </span>}
            </span>
          }/>
        </span>
        <span>
          <ChainInfoItem title={
          <span>
          <BCInfoToolTip child={`This statistic is accurate from TxBlock ${BCInfo?.startTxBlock}. Requires user to stay on the Home Page`}/>
          {' '}
          Recent Max Observed Txn Count:
          </span>}
          data={
            <span>
              {BCInfo?.maxTxnCount} 
              {' '}
              {BCInfo?.startTxBlock && <span className="text-xs">
                <span className="text-gray-500">
                  (on TxBlock  
                  {' '}
                  <BlockLink blockTag={BCInfo?.startTxBlock} />
                  ) 
                </span>
              </span>}
            </span>
          }/>
        </span>
        </div>
      :
        
      <PendingChainInfoResults />
      }
      </div>
    </ContentFrame>
  );
};

export default memo(ChainInfo);
