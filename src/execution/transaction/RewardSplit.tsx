import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { faBurn, faCoins, faSplotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import FormattedBalance from "../../components/FormattedBalance";
import PercentageGauge from "../../components/PercentageGauge";
import { TransactionData } from "../../types";
import { useChainInfo } from "../../useChainInfo";
import { useBlockDataFromTransaction } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { calculateFee, getFeePercents } from "../feeCalc";

type RewardSplitProps = {
  txData: TransactionData;
};

// Only can be shown when gasPrice is defined
const RewardSplit: React.FC<RewardSplitProps> = ({ txData }) => {
  const { provider } = useContext(RuntimeContext);
  const block = useBlockDataFromTransaction(provider, txData);

  const {
    nativeCurrency: { symbol },
  } = useChainInfo();

  const { totalFees, feeDist } = calculateFee(txData, block);
  const feePerc = getFeePercents(feeDist);

  return (
    <div className="inline-block">
      <div className="grid grid-cols-2 items-center gap-x-2 gap-y-1 text-sm">
        <PercentageGauge
          perc={feePerc.burned}
          bgColor="bg-orange-100"
          bgColorPerc="bg-orange-500"
          textColor="text-orange-800"
        />
        <div className="flex items-baseline space-x-1">
          <span className="flex space-x-1 text-orange-500">
            <span title="Burnt fees">
              <FontAwesomeIcon icon={faBurn} size="1x" />
            </span>
            <span>
              <span className="line-through">
                <FormattedBalance value={feeDist.burned} />
              </span>{" "}
              {symbol}
            </span>
          </span>
        </div>
        <PercentageGauge
          perc={feePerc.tip}
          bgColor="bg-amber-100"
          bgColorPerc="bg-amber-300"
          textColor="text-amber-700"
        />
        <div className="flex items-baseline space-x-1">
          <span className="flex space-x-1">
            <span className="text-amber-300" title="Miner fees">
              <FontAwesomeIcon icon={faCoins} size="1x" />
            </span>
            <span>
              <FormattedBalance value={feeDist.tip} symbol={symbol} />
            </span>
          </span>
        </div>
        {feeDist.blob > 0n && (
          <>
            <PercentageGauge
              perc={feePerc.blob}
              bgColor="bg-rose-100"
              bgColorPerc="bg-rose-300"
              textColor="text-rose-700"
            />
            <div className="flex items-baseline space-x-1">
              <span className="flex space-x-1">
                <span className="text-rose-300" title="Blob fee">
                  <FontAwesomeIcon icon={faSplotch} size="1x" />
                </span>
                <span>
                  <FormattedBalance value={feeDist.blob} symbol={symbol} />
                </span>
              </span>
            </div>
          </>
        )}
        {feePerc.opL1Fee > 0n && (
          <>
            <PercentageGauge
              perc={feePerc.opL1Fee}
              bgColor="bg-blue-100"
              bgColorPerc="bg-blue-300"
              textColor="text-blue-700"
            />
            <div className="flex items-baseline space-x-1">
              <span className="flex space-x-1">
                <span className="text-blue-300" title="L1 Security fees">
                  <FontAwesomeIcon icon={faEthereum} size="1x" />
                </span>
                <span>
                  <FormattedBalance value={feeDist.opL1Fee} symbol={symbol} />
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(RewardSplit);
