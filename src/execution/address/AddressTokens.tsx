import { FC, useContext, useMemo, useState } from "react";
import { Switch } from "@headlessui/react";
import { getAddress } from "@ethersproject/address";
import { AddressAwareComponentProps } from "../types";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import StandardTable from "../../components/StandardTable";
import StandardTHead from "../../components/StandardTHead";
import StandardTBody from "../../components/StandardTBody";
import SearchResultNavBar from "../../search/SearchResultNavBar";
import TokenBalance from "./TokenBalance";
import { RuntimeContext } from "../../useRuntime";
import { useERC20Holdings } from "../../ots2/usePrototypeTransferHooks";
import { useTokenSet } from "../../kleros/useTokenList";

const AddressTokens: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);
  const erc20List = useERC20Holdings(provider, address);

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
        <StandardSelectionBoundary>
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
        </StandardSelectionBoundary>
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
  <SearchResultNavBar
    total={filterApplied ? filteredList?.length : erc20List?.length}
    totalFormatter={(total: number) => (
      <>
        {`${total} ${total !== 1 ? "tokens" : "token"} found`} (
        <Switch
          className="hover:cursor-pointer hover:underline"
          onChange={() => applyFilter(!filterApplied)}
        >
          {filterApplied
            ? `${erc20List.length - filteredList.length} hidden`
            : "hide spam"}
        </Switch>
        )
      </>
    )}
  />
);

export default AddressTokens;
