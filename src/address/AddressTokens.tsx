import { FC, useContext, useMemo, useState } from "react";
import { Switch } from "@headlessui/react";
import { getAddress } from "@ethersproject/address";
import ContentFrame from "../ContentFrame";
import TokenBalance from "./TokenBalance";
import { RuntimeContext } from "../useRuntime";
import { useERC20Holdings } from "../useErigonHooks";
import { SelectionContext, useSelection } from "../useSelection";
import { ChecksummedAddress } from "../types";
import { useTokenSet } from "../kleros/useTokenList";

type AddressTokensProps = {
  address: ChecksummedAddress;
};

const AddressTokens: FC<AddressTokensProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);
  const erc20List = useERC20Holdings(provider, address);

  const selectionCtx = useSelection();
  const [enabled, setEnabled] = useState<boolean>(true);
  const tokenSet = useTokenSet(provider?.network.chainId);
  const filteredList = useMemo(() => {
    if (erc20List === undefined) {
      return undefined;
    }
    if (!enabled) {
      return erc20List;
    }

    return erc20List.filter((t) => tokenSet.has(getAddress(t)));
  }, [erc20List, tokenSet, enabled]);

  return (
    <ContentFrame tabs>
      <Switch.Group>
        <div className="flex items-baseline py-4 text-sm">
          <Switch.Label className="mr-2">Apply filter</Switch.Label>
          <Switch
            className={`${
              enabled ? "bg-blue-600" : "bg-gray-200"
            } self-center relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            checked={enabled}
            onChange={setEnabled}
          >
            <span
              className={`${
                enabled ? "translate-x-5" : "translate-x-1"
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </Switch.Group>
      {erc20List && filteredList && (
        <SelectionContext.Provider value={selectionCtx}>
          <TotalBar erc20List={erc20List} filteredList={filteredList} />
          <table className="w-full border-t border-b border-gray-200 px-2 py-2 text-sm text-left table-fixed [&>*>tr]:items-baseline">
            <thead>
              <tr className="text-gray-500 bg-gray-100 [&>th]:px-2 [&>th]:py-2 [&>th]:truncate">
                <th className="w-96">Token</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-gray-200 hover:[&>tr]:bg-skin-table-hover [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr>td]:truncate">
              {filteredList.map((t) => (
                <TokenBalance
                  key={t}
                  holderAddress={address}
                  tokenAddress={t}
                />
              ))}
            </tbody>
          </table>
          <TotalBar erc20List={erc20List} filteredList={filteredList} />
        </SelectionContext.Provider>
      )}
    </ContentFrame>
  );
};

type TotalBarProps = {
  erc20List: ReadonlyArray<unknown>;
  filteredList: ReadonlyArray<unknown>;
};

const TotalBar: FC<TotalBarProps> = ({ erc20List, filteredList }) => (
  <div className="flex justify-between items-baseline py-3">
    <div className="text-sm text-gray-500">
      {erc20List === undefined || filteredList === undefined ? (
        <>Waiting for search results...</>
      ) : (
        <>
          {filteredList.length} tokens found (
          {erc20List.length - filteredList.length} hidden)
        </>
      )}
    </div>
  </div>
);

export default AddressTokens;
