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
  const paidFees = txData.gasPrice.mul(txData.gasUsed);
  const burntFees = txData.blockBaseFeePerGas!.mul(txData.gasUsed);

  const minerReward = paidFees.sub(burntFees);
  const burntPerc =
    Math.round(burntFees.mul(10000).div(paidFees).toNumber()) / 100;
  const minerPerc = Math.round((100 - burntPerc) * 100) / 100;

  return (
    <div className="inline-block">
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 items-center text-sm">
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
              Ether
            </span>
          </span>
        </div>
        <PercentageGauge
          perc={minerPerc}
          bgColor="bg-yellow-100"
          bgColorPerc="bg-yellow-300"
          textColor="text-yellow-700"
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
