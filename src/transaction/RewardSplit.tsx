import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn, faCoins } from "@fortawesome/free-solid-svg-icons";
import FormattedBalance from "../components/FormattedBalance";
import { TransactionData } from "../types";
import PercentageGauge from "../components/PercentageGauge";

type RewardSplitProps = {
  txData: TransactionData;
};

const RewardSplit: React.FC<RewardSplitProps> = ({ txData }) => {
  const burntFees = txData.blockBaseFeePerGas!.mul(txData.gasUsed);
  const minerReward = txData.gasPrice.mul(txData.gasUsed).sub(burntFees);
  const burntPerc =
    burntFees.mul(10000).div(txData.gasPrice.mul(txData.gasUsed)).toNumber() /
    100;

  return (
    <div className="inline-block">
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 items-center text-sm">
        <PercentageGauge
          perc={burntPerc}
          bgFull="bg-orange-100"
          bgPerc="bg-orange-500"
          textPerc="text-orange-800"
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
              Ether
            </span>
          </span>
        </div>
        <PercentageGauge
          perc={100 - burntPerc}
          bgFull="bg-yellow-100"
          bgPerc="bg-yellow-300"
          textPerc="text-yellow-700"
        />
        <div className="flex items-baseline space-x-1">
          <span className="flex space-x-1">
            <span className="text-yellow-300" title="Miner fees">
              <FontAwesomeIcon icon={faCoins} size="1x" />
            </span>
            <span>
              <FormattedBalance value={minerReward} /> Ether
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RewardSplit);
