import { useState } from "react";

export enum FeeDisplay {
  TX_FEE,
  GAS_PRICE,
}

export const useFeeToggler = (): [FeeDisplay, () => void] => {
  const [feeDisplay, setFeeDisplay] = useState<FeeDisplay>(FeeDisplay.TX_FEE);
  const feeDisplayToggler = () => {
    if (feeDisplay === FeeDisplay.TX_FEE) {
      setFeeDisplay(FeeDisplay.GAS_PRICE);
    } else {
      setFeeDisplay(FeeDisplay.TX_FEE);
    }
  };

  return [feeDisplay, feeDisplayToggler];
};
