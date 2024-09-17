import { Switch } from "@headlessui/react";
import { getAddress } from "ethers";
import { FC, useContext, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ContentFrame from "../../components/ContentFrame";
import StandardScrollableTable from "../../components/StandardScrollableTable";
import StandardTBody from "../../components/StandardTBody";
import StandardTHead from "../../components/StandardTHead";
import { useTokenSet } from "../../kleros/useTokenList";
import { useERC20Holdings } from "../../ots2/usePrototypeTransferHooks";
import SearchResultNavBar from "../../search/SearchResultNavBar";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import { type AddressOutletContext } from "../AddressMainPage";
import TokenBalance from "./TokenBalance";

const AddressTokens: FC = () => {
  const { address } = useOutletContext() as AddressOutletContext;
  const { provider } = useContext(RuntimeContext);
  const erc20List = useERC20Holdings(provider, address);
  usePageTitle(`Token Balances | ${address}`);

  const [enabled, setEnabled] = useState<boolean>(true);
  const tokenSet = useTokenSet(provider._network.chainId);
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
          <StandardScrollableTable>
            <StandardTHead>
              <th className="w-96">Token</th>
              <th className="w-80">Balance</th>
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
          </StandardScrollableTable>
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
