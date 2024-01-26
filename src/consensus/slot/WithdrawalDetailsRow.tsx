import { FC, memo } from "react";
import { balancePreset } from "../../components/FiatValue";
import NativeTokenAmountAndFiat from "../../components/NativeTokenAmountAndFiat";
import DecoratedAddressLink from "../../execution/components/DecoratedAddressLink";
import CheckedValidatorLink from "../components/CheckedValidatorLink";

const GWEI = 10n ** 9n;

interface WithdrawalDetailsRowProps {
  validatorIndex: number;
  address: string;
  amount: bigint;
}

const WithdrawalDetailsRow: FC<WithdrawalDetailsRowProps> = ({
  validatorIndex,
  address,
  amount,
}) => {
  return (
    <tr>
      <td>
        <CheckedValidatorLink validatorIndex={validatorIndex} />
      </td>
      <td>
        <DecoratedAddressLink address={address} />
      </td>
      <td>
        <NativeTokenAmountAndFiat value={amount} {...balancePreset} />
      </td>
    </tr>
  );
};

export default memo(WithdrawalDetailsRow);
