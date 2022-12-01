import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BigNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";
import ContentFrame from "../../ContentFrame";
import InfoRow from "../../components/InfoRow";
import AddressBalance from "../../address/AddressBalance";
import Timestamp from "../../components/Timestamp";
import HexValue from "../../components/HexValue";
import { useEpochTimestamp, useValidator } from "../../useConsensus";
import EpochLink from "../components/EpochLink";

const GWEI = BigNumber.from(10).pow(9);

const Overview: FC = () => {
  const { validatorIndex } = useParams();
  if (validatorIndex === undefined) {
    throw new Error("validatorIndex couldn't be undefined here");
  }
  const validatorAsNumber = parseInt(validatorIndex);
  const validator = useValidator(validatorAsNumber);
  useEffect(() => {
    if (validator !== undefined) {
      document.title = `Validator #${validatorIndex} | Otterscan`;
    }
  }, [validatorIndex, validator]);

  const elegibleTimestamp = useEpochTimestamp(
    validator.data.validator.activation_eligibility_epoch
  );
  const activationTimestamp = useEpochTimestamp(
    validator.data.validator.activation_epoch
  );

  return (
    <ContentFrame tabs>
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
            epochNumber={validator.data.validator.activation_eligibility_epoch}
          />
          {elegibleTimestamp && (
            <Timestamp value={elegibleTimestamp.toNumber()} />
          )}
        </div>
      </InfoRow>
      <InfoRow title="Activation Epoch">
        <div className="flex space-x-2">
          <EpochLink epochNumber={validator.data.validator.activation_epoch} />
          {activationTimestamp && (
            <Timestamp value={activationTimestamp.toNumber()} />
          )}
        </div>
      </InfoRow>
    </ContentFrame>
  );
};

export default Overview;
