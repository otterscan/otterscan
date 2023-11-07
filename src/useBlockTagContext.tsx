import { createContext, useContext } from "react";

/**
 * This context means child components have a temporal context expressed in
 * terms of BlockTag.
 *
 * One obvious example is: child components want to show an UI indicator if
 * the address is an EOA or contract. But if this address is currently a
 * contract and it is an UI element of an existing transaction, it may be that
 * at the time (block) the transaction happened it was still an EOA (create2),
 * so it should be displayed as an EOA.
 */
export const BlockNumberContext = createContext<number | "latest" | undefined>(
  undefined,
);

export const useBlockNumberContext = () => useContext(BlockNumberContext);
