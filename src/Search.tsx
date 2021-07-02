import { useLocation, useHistory } from "react-router-dom";
import { ethers } from "ethers";
import queryString from "query-string";

type SearchParams = {
  q: string;
};

const Search: React.FC = () => {
  const location = useLocation<SearchParams>();
  const history = useHistory();

  const qs = queryString.parse(location.search);
  const q = (qs.q ?? "").toString();
  if (ethers.utils.isAddress(q)) {
    history.replace(`/address/${q}`);
    return <></>;
  }
  if (ethers.utils.isHexString(q, 32)) {
    history.replace(`/tx/${q}`);
    return <></>;
  }

  const blockNumber = parseInt(q);
  if (!isNaN(blockNumber)) {
    history.replace(`/block/${blockNumber}`);
    return <></>;
  }

  // Assume it is an ENS name
  history.replace(`/address/${q}`);
  return <></>;
};

export default Search;
