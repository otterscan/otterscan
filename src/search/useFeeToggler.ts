import { useState } from "react";

export type Enum<T> = {
  [K in keyof T]: T[K];
};

export enum FeeDisplay {
  TX_FEE,
  TX_FEE_USD,
  GAS_PRICE,
}

export enum ValueDisplay {
  VALUE_NATIVE,
  VALUE_USD,
}

export function useToggler<T extends Enum<T>>(
  enumType: T,
): [T[keyof T], () => void] {
  const [toggledValue, setToggledValue] = useState<T[keyof T]>(
    Object.values(enumType)[Object.values(enumType).length / 2] as T[keyof T],
  );

  const toggler = () => {
    const nextIndex = Object.values(enumType)[
      ((toggledValue + 1) % (Object.values(enumType).length / 2)) +
        Object.values(enumType).length / 2
    ] as T[keyof T];
    setToggledValue(nextIndex);
  };

  return [toggledValue, toggler];
}
