import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Route, Switch, useParams } from "react-router-dom";
import { BigNumber, ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { provider } from "./ethersconfig";
import StandardFrame from "./StandardFrame";
import StandardSubtitle from "./StandardSubtitle";
import Tab from "./components/Tab";
import ContentFrame from "./ContentFrame";
import BlockLink from "./components/BlockLink";
import AddressOrENSName from "./components/AddressOrENSName";
import AddressLink from "./components/AddressLink";
import Copy from "./components/Copy";
import Timestamp from "./components/Timestamp";
import InternalTransfer from "./components/InternalTransfer";
import GasValue from "./components/GasValue";
import FormattedBalance from "./components/FormattedBalance";
import TokenTransferItem from "./TokenTransferItem";
import erc20 from "./erc20.json";
import { TokenMetas, TokenTransfer, TransactionData, Transfer } from "./types";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

type TransactionParams = {
  txhash: string;
};

const Transaction: React.FC = () => {
  const params = useParams<TransactionParams>();
  const { txhash } = params;

  const [txData, setTxData] = useState<TransactionData>();
  useEffect(() => {
    const readBlock = async () => {
      const [_response, _receipt] = await Promise.all([
        provider.getTransaction(txhash),
        provider.getTransactionReceipt(txhash),
      ]);
      const _block = await provider.getBlock(_receipt.blockNumber);
      document.title = `Transaction ${_response.hash} | Otterscan`;

      // Extract token transfers
      const tokenTransfers: TokenTransfer[] = [];
      for (const l of _receipt.logs) {
        if (l.topics.length !== 3) {
          continue;
        }
        if (l.topics[0] !== TRANSFER_TOPIC) {
          continue;
        }
        tokenTransfers.push({
          token: l.address,
          from: ethers.utils.getAddress(
            ethers.utils.hexDataSlice(ethers.utils.arrayify(l.topics[1]), 12)
          ),
          to: ethers.utils.getAddress(
            ethers.utils.hexDataSlice(ethers.utils.arrayify(l.topics[2]), 12)
          ),
          value: BigNumber.from(l.data),
        });
      }

      // Extract token meta
      const tokenMetas: TokenMetas = {};
      for (const t of tokenTransfers) {
        if (tokenMetas[t.token]) {
          continue;
        }
        const erc20Contract = new ethers.Contract(t.token, erc20, provider);
        const [name, symbol, decimals] = await Promise.all([
          erc20Contract.name(),
          erc20Contract.symbol(),
          erc20Contract.decimals(),
        ]);
        tokenMetas[t.token] = {
          name,
          symbol,
          decimals,
        };
      }

      setTxData({
        transactionHash: _receipt.transactionHash,
        status: _receipt.status === 1,
        blockNumber: _receipt.blockNumber,
        transactionIndex: _receipt.transactionIndex,
        confirmations: _receipt.confirmations,
        timestamp: _block.timestamp,
        miner: _block.miner,
        from: _receipt.from,
        to: _receipt.to,
        value: _response.value,
        tokenTransfers,
        tokenMetas,
        fee: _response.gasPrice!.mul(_receipt.gasUsed),
        gasPrice: _response.gasPrice!,
        gasLimit: _response.gasLimit,
        gasUsed: _receipt.gasUsed,
        gasUsedPerc:
          _receipt.gasUsed.toNumber() / _response.gasLimit.toNumber(),
        nonce: _response.nonce,
        data: _response.data,
        logs: _receipt.logs,
      });
    };
    readBlock();
  }, [txhash]);

  const [transfers, setTransfers] = useState<Transfer[]>();
  const sendsEthToMiner = useMemo(() => {
    if (!txData || !transfers) {
      return false;
    }

    for (const t of transfers) {
      if (t.to === txData.miner) {
        return true;
      }
    }
    return false;
  }, [txData, transfers]);

  const traceTransfersUsingOtsTrace = useCallback(async () => {
    if (!txData) {
      return;
    }

    const r = await provider.send("ots_getTransactionTransfers", [
      txData.transactionHash,
    ]);
    const _transfers: Transfer[] = [];
    for (const t of r) {
      _transfers.push({
        from: ethers.utils.getAddress(t.from),
        to: ethers.utils.getAddress(t.to),
        value: t.value,
      });
    }

    setTransfers(_transfers);
  }, [txData]);
  useEffect(() => {
    traceTransfersUsingOtsTrace();
  }, [traceTransfersUsingOtsTrace]);

  return (
    <StandardFrame>
      <StandardSubtitle>Transaction Details</StandardSubtitle>
      {txData && (
        <>
          <div className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
            <Tab href={`/tx/${txhash}`}>Overview</Tab>
            <Tab href={`/tx/${txhash}/logs`}>
              Logs{txData && ` (${txData.logs.length})`}
            </Tab>
          </div>
          <Switch>
            <Route path="/tx/:txhash/" exact>
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
                <InfoRow title="Block">
                  <div className="flex items-baseline space-x-2">
                    <BlockLink blockTag={txData.blockNumber} />
                    <span className="rounded text-xs bg-gray-100 text-gray-500 px-2 py-1">
                      {txData.confirmations} Block Confirmations
                    </span>
                  </div>
                </InfoRow>
                <InfoRow title="Timestamp">
                  <Timestamp value={txData.timestamp} />
                </InfoRow>
                <InfoRow title="From">
                  <div className="flex items-baseline space-x-2">
                    <AddressOrENSName
                      address={txData.from}
                      minerAddress={txData.miner}
                    />
                    <Copy value={txData.from} />
                  </div>
                </InfoRow>
                <InfoRow title="Interacted With (To)">
                  <div className="flex items-baseline space-x-2">
                    <AddressOrENSName
                      address={txData.to}
                      minerAddress={txData.miner}
                    />
                    <Copy value={txData.to} />
                  </div>
                  {transfers && (
                    <div className="mt-2 space-y-1">
                      {transfers.map((t, i) => (
                        <InternalTransfer
                          key={i}
                          txData={txData}
                          transfer={t}
                        />
                      ))}
                    </div>
                  )}
                </InfoRow>
                <InfoRow title="Transaction Action"></InfoRow>
                {txData.tokenTransfers.length > 0 && (
                  <InfoRow
                    title={`Tokens Transferred (${txData.tokenTransfers.length})`}
                  >
                    <div className="space-y-2">
                      {txData.tokenTransfers.map((t, i) => (
                        <TokenTransferItem
                          key={i}
                          t={t}
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
                <InfoRow title="Transaction Fee">
                  <FormattedBalance value={txData.fee} /> Ether
                </InfoRow>
                <InfoRow title="Gas Price">
                  <div className="flex items-baseline space-x-1">
                    <span>
                      <FormattedBalance value={txData.gasPrice} /> Ether (
                      <FormattedBalance
                        value={txData.gasPrice}
                        decimals={9}
                      />{" "}
                      Gwei)
                    </span>
                    {sendsEthToMiner && (
                      <span className="rounded text-yellow-500 bg-yellow-100 text-xs px-2 py-1">
                        Flashbots
                      </span>
                    )}
                  </div>
                </InfoRow>
                <InfoRow title="Ether Price">N/A</InfoRow>
                <InfoRow title="Gas Limit">
                  <GasValue value={txData.gasLimit} />
                </InfoRow>
                <InfoRow title="Gas Used by Transaction">
                  <GasValue value={txData.gasUsed} /> (
                  {(txData.gasUsedPerc * 100).toFixed(2)}%)
                </InfoRow>
                <InfoRow title="Nonce">{txData.nonce}</InfoRow>
                <InfoRow title="Position in Block">
                  <span className="rounded px-2 py-1 bg-gray-100 text-gray-500 text-xs">
                    {txData.transactionIndex}
                  </span>
                </InfoRow>
                <InfoRow title="Input Data">
                  <textarea
                    className="w-full h-40 bg-gray-50 text-gray-500 font-mono focus:outline-none border rounded p-2"
                    value={txData.data}
                    readOnly
                  />
                </InfoRow>
              </ContentFrame>
            </Route>
            <Route path="/tx/:txhash/logs/" exact>
              <ContentFrame tabs>
                <div className="text-sm py-4">
                  Transaction Receipt Event Logs
                </div>
                {txData &&
                  txData.logs.map((l, i) => (
                    <div className="flex space-x-10 py-5" key={i}>
                      <div>
                        <span className="rounded-full w-12 h-12 flex items-center justify-center bg-green-50 text-green-500">
                          {l.logIndex}
                        </span>
                      </div>
                      <div className="w-full space-y-2">
                        <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                          <div className="font-bold text-right">Address</div>
                          <div className="col-span-11">
                            <AddressLink address={l.address} />
                          </div>
                        </div>
                        {l.topics.map((t, i) => (
                          <div
                            className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm"
                            key={i}
                          >
                            <div className="text-right">
                              {i === 0 && "Topics"}
                            </div>
                            <div className="flex space-x-2 items-center col-span-11 font-mono">
                              <span className="rounded bg-gray-100 text-gray-500 px-2 py-1 text-xs">
                                {i}
                              </span>
                              <span>{t}</span>
                            </div>
                          </div>
                        ))}
                        <div className="grid grid-cols-12 gap-x-3 gap-y-5 text-sm">
                          <div className="text-right pt-2">Data</div>
                          <div className="col-span-11">
                            <textarea
                              className="w-full h-20 bg-gray-50 font-mono focus:outline-none border rounded p-2"
                              value={l.data}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </ContentFrame>
            </Route>
          </Switch>
        </>
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

export default React.memo(Transaction);
