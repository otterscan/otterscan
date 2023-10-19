import { FC } from "react";
import ContentFrame from "../../components/ContentFrame";
import { balancePreset } from "../../components/FiatValue";
import HexValue from "../../components/HexValue";
import InfoRow from "../../components/InfoRow";
import NativeTokenAmountAndFiat from "../../components/NativeTokenAmountAndFiat";
import Timestamp from "../../components/Timestamp";
import { useEpochTimestamp, useValidator } from "../../useConsensus";
import { usePageTitle } from "../../useTitle";
import { commify } from "../../utils/utils";
import EpochLink from "../components/EpochLink";
import WithdrawalCredentials from "./WithdrawalCredentials";

const GWEI = 10n ** 9n;

type OverviewProps = {
  validatorIndex: string;
};

const Overview: FC<OverviewProps> = ({ validatorIndex }) => {
  const validator = useValidator(validatorIndex);

  if (validator !== undefined) {
    usePageTitle(`Validator #${validator.data.index}`);
  }

  const eligibleTimestamp = useEpochTimestamp(
    validator?.data.validator.activation_eligibility_epoch,
  );
  const activationTimestamp = useEpochTimestamp(
    validator?.data.validator.activation_epoch,
  );
  const exitTimestamp = useEpochTimestamp(validator?.data.validator.exit_epoch);
  const withdrawableTimestamp = useEpochTimestamp(
    validator?.data.validator.withdrawable_epoch,
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
          <InfoRow title="Withdrawal Credentials">
            <WithdrawalCredentials
              credentials={validator.data.validator.withdrawal_credentials}
            />
          </InfoRow>
          <InfoRow title="Balance">
            <NativeTokenAmountAndFiat
              value={BigInt(validator.data.balance) * GWEI}
              {...balancePreset}
            />
          </InfoRow>
          <InfoRow title="Effective Balance">
            <NativeTokenAmountAndFiat
              value={BigInt(validator.data.validator.effective_balance) * GWEI}
              {...balancePreset}
            />
          </InfoRow>
          <InfoRow title="Status">{validator.data.status}</InfoRow>
          {eligibleTimestamp && (
            <InfoRow title="Eligible Epoch">
              <div className="flex space-x-2">
                <EpochLink
                  epochNumber={
                    validator.data.validator.activation_eligibility_epoch
                  }
                />
                {eligibleTimestamp && <Timestamp value={eligibleTimestamp} />}
              </div>
            </InfoRow>
          )}
          {activationTimestamp && (
            <InfoRow title="Activation Epoch">
              <div className="flex space-x-2">
                <EpochLink
                  epochNumber={validator.data.validator.activation_epoch}
                />
                {activationTimestamp && (
                  <Timestamp value={activationTimestamp} />
                )}
              </div>
            </InfoRow>
          )}
          {exitTimestamp && (
            <InfoRow title="Exit Epoch">
              <div className="flex space-x-2">
                <EpochLink epochNumber={validator.data.validator.exit_epoch} />
                <Timestamp value={exitTimestamp} />
              </div>
            </InfoRow>
          )}
          {withdrawableTimestamp && (
            <InfoRow title="Withdrawable Epoch">
              <div className="flex space-x-2">
                <EpochLink
                  epochNumber={validator.data.validator.withdrawable_epoch}
                />
                <Timestamp value={withdrawableTimestamp} />
              </div>
            </InfoRow>
          )}
        </>
      )}
    </ContentFrame>
  );
};

export default Overview;
