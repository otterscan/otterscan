import { FC, useContext } from "react";
import ContentFrame from "../ContentFrame";
import TokenBalance from "./TokenBalance";
import { RuntimeContext } from "../useRuntime";
import { useERC20Holdings } from "../useErigonHooks";
import { SelectionContext, useSelection } from "../useSelection";
import { ChecksummedAddress } from "../types";

type AddressTokensProps = {
  address: ChecksummedAddress;
};

const AddressTokens: FC<AddressTokensProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);
  const erc20List = useERC20Holdings(provider, address);
  const selectionCtx = useSelection();

  return (
    <ContentFrame tabs>
      {erc20List && (
        <SelectionContext.Provider value={selectionCtx}>
          <table className="w-full border-t border-b border-gray-200 px-2 py-2 text-sm text-left table-fixed [&>*>tr]:items-baseline">
            <thead>
              <tr className="text-gray-500 bg-gray-100 [&>th]:px-2 [&>th]:py-2 [&>th]:truncate">
                <th className="w-96">Token</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-gray-200 hover:[&>tr]:bg-skin-table-hover [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr>td]:truncate">
              {erc20List.map((t) => (
                <TokenBalance
                  key={t}
                  holderAddress={address}
                  tokenAddress={t}
                />
              ))}
            </tbody>
          </table>
        </SelectionContext.Provider>
      )}
    </ContentFrame>
  );
};

export default AddressTokens;
