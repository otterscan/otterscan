import { FC, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { useProxyAttributes } from "../../ots2/usePrototypeTransferHooks";
import { RuntimeContext } from "../../useRuntime";
import { type AddressOutletContext } from "../AddressMainPage";
import Contracts from "./Contracts";

const ProxyContract: FC = () => {
  const { address } = useOutletContext() as AddressOutletContext;
  const { provider } = useContext(RuntimeContext);
  const proxyAttrs = useProxyAttributes(provider, address);
  return (
    <Contracts
      checksummedAddress={proxyAttrs.logicAddress!}
      match={proxyAttrs.proxyMatch}
    />
  );
};

export default ProxyContract;
