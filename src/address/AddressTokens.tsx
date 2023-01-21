import { FC, useContext, useMemo, useState } from "react";
import { Switch } from "@headlessui/react";
import { getAddress } from "@ethersproject/address";
import ContentFrame from "../ContentFrame";
import StandardTable from "../components/StandardTable";
import StandardTHead from "../components/StandardTHead";
import StandardTBody from "../components/StandardTBody";
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
    return erc20List.filter((t) => tokenSet.has(getAddress(t)));
  }, [erc20List, tokenSet]);
  const tokenList = enabled ? filteredList : erc20List;

  return (
    <ContentFrame tabs>
      {erc20List && filteredList && tokenList && (
        <SelectionContext.Provider value={selectionCtx}>
          <TotalBar
            erc20List={erc20List}
            filteredList={filteredList}
            filterApplied={enabled}
            applyFilter={setEnabled}
          />
          <StandardTable>
            <StandardTHead>
              <th className="w-96">Token</th>
              <th>Balance</th>
            </StandardTHead>
            <StandardTBody>
              {tokenList.map((t) => (
                <TokenBalance
                  key={t}
                  holderAddress={address}
                  tokenAddress={t}
                />
              ))}
            </StandardTBody>
          </StandardTable>
          <TotalBar
            erc20List={erc20List}
            filteredList={filteredList}
            filterApplied={enabled}
            applyFilter={setEnabled}
          />
        </SelectionContext.Provider>
      )}
    </ContentFrame>
  );
};

type TotalBarProps = {
  erc20List: ReadonlyArray<unknown>;
  filteredList: ReadonlyArray<unknown>;
  filterApplied: boolean;
  applyFilter: (apply: boolean) => void;
};

const TotalBar: FC<TotalBarProps> = ({
  erc20List,
  filteredList,
  filterApplied,
  applyFilter,
}) => (
  <div className="flex justify-between items-baseline py-3">
    <div className="text-sm text-gray-500">
      {erc20List === undefined || filteredList === undefined ? (
        <>Waiting for search results...</>
      ) : (
        <>
          {filteredList.length} tokens found (
          <Switch
            className="hover:underline hover:cursor-pointer"
            onChange={() => applyFilter(!filterApplied)}
          >
            {filterApplied ? (
              <>{erc20List.length - filteredList.length} hidden</>
            ) : (
              <>filter</>
            )}
          </Switch>
          )
        </>
      )}
    </div>
  </div>
);

export default AddressTokens;
