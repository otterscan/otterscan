import { FC, useEffect } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";
import ContentFrame from "../../ContentFrame";
import InfoRow from "../../components/InfoRow";
import AddressBalance from "../../address/AddressBalance";
import Timestamp from "../../components/Timestamp";
import HexValue from "../../components/HexValue";
import EpochLink from "../components/EpochLink";
import { useEpochTimestamp, useValidator } from "../../useConsensus";

const GWEI = BigNumber.from(10).pow(9);

type OverviewProps = {
  validatorIndex: string;
};

const Overview: FC<OverviewProps> = ({ validatorIndex }) => {
  const validator = useValidator(validatorIndex);

  useEffect(() => {
    if (validator !== undefined) {
      document.title = `Validator #${validator.data.index} | Otterscan`;
    }
  }, [validatorIndex, validator]);

  const elegibleTimestamp = useEpochTimestamp(
    validator?.data.validator.activation_eligibility_epoch
  );
  const activationTimestamp = useEpochTimestamp(
    validator?.data.validator.activation_epoch
  );

  return (
    <ContentFrame tabs>
      {validator && (
        <>
          <InfoRow title="Index">
            {commify(validator.data.index.toString())}
          </InfoRow>
          <InfoRow title="Public Key">
            <HexValue value={validator.data.validator.pubkey} />
          </InfoRow>
          <InfoRow title="Balance">
            <div className="space-x-2">
              <AddressBalance
                balance={BigNumber.from(validator.data.balance).mul(GWEI)}
              />
            </div>
          </InfoRow>
          <InfoRow title="Effective Balance">
            <div className="space-x-2">
              <AddressBalance
                balance={BigNumber.from(
                  validator.data.validator.effective_balance
                ).mul(GWEI)}
              />
            </div>
          </InfoRow>
          <InfoRow title="Status">{validator.data.status}</InfoRow>
          <InfoRow title="Eligible Epoch">
            <div className="flex space-x-2">
              <EpochLink
                epochNumber={
                  validator.data.validator.activation_eligibility_epoch
                }
              />
              {elegibleTimestamp && <Timestamp value={elegibleTimestamp} />}
            </div>
          </InfoRow>
          <InfoRow title="Activation Epoch">
            <div className="flex space-x-2">
              <EpochLink
                epochNumber={validator.data.validator.activation_epoch}
              />
              {activationTimestamp && <Timestamp value={activationTimestamp} />}
            </div>
          </InfoRow>
        </>
      )}
    </ContentFrame>
  );
};

export default Overview;
