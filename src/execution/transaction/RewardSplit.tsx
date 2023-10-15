import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn, faCoins } from "@fortawesome/free-solid-svg-icons";
import FormattedBalance from "../../components/FormattedBalance";
import PercentageGauge from "../../components/PercentageGauge";
import { RuntimeContext } from "../../useRuntime";
import { useBlockDataFromTransaction } from "../../useErigonHooks";
import { useChainInfo } from "../../useChainInfo";
import { TransactionData } from "../../types";

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
  const paidFees = txData.gasPrice! * txData.confirmedData!.gasUsed;
  const burntFees = block
    ? block.baseFeePerGas! * txData.confirmedData!.gasUsed
    : 0n;

  const minerReward = paidFees - burntFees;
  const burntPerc = Number((burntFees * 10000n) / paidFees) / 100;
  const minerPerc = Math.round((100 - burntPerc) * 100) / 100;

  return (
    <div className="inline-block">
      <div className="grid grid-cols-2 items-center gap-x-2 gap-y-1 text-sm">
        <PercentageGauge
          perc={burntPerc}
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
                <FormattedBalance value={burntFees} />
              </span>{" "}
              {symbol}
            </span>
          </span>
        </div>
        <PercentageGauge
          perc={minerPerc}
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
              <FormattedBalance value={minerReward} symbol={symbol} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RewardSplit);
