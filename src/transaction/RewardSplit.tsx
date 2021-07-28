import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn, faCoins } from "@fortawesome/free-solid-svg-icons";
import FormattedBalance from "../components/FormattedBalance";
import { TransactionData } from "../types";

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
    <div className="inline-flex space-x-2">
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
      <span className="flex space-x-1">
        <span className="text-yellow-300" title="Miner fees">
          <FontAwesomeIcon icon={faCoins} size="1x" />
        </span>
        <span>
          <FormattedBalance value={minerReward} /> Ether
        </span>
      </span>
      <div className="self-center w-40 border rounded border-gray-200">
        <div className="w-full h-5 rounded bg-orange-500 relative">
          <div
            className="absolute top-0 right-0 bg-yellow-200 h-full rounded-r"
            style={{ width: `${100 - burntPerc}%` }}
          ></div>
          <div className="w-full h-full absolute flex mix-blend-multiply text-sans text-gray-600">
            <span className="m-auto">{burntPerc}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RewardSplit);
