import React, { useState, useContext } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn } from "@fortawesome/free-solid-svg-icons";
import Logo from "./Logo";
import Timestamp from "./components/Timestamp";
import { RuntimeContext } from "./useRuntime";
import { useLatestBlock } from "./useLatestBlock";
import { blockURL } from "./url";

const Home: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const [search, setSearch] = useState<string>();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const history = useHistory();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCanSubmit(e.target.value.trim().length > 0);
    setSearch(e.target.value.trim());
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    history.push(`/search?q=${search}`);
  };

  const latestBlock = useLatestBlock(provider);

  document.title = "Home | Otterscan";

  return (
    <div className="m-auto">
      <Logo />
      <form
        className="flex flex-col"
        onSubmit={handleSubmit}
        autoComplete="off"
        spellCheck={false}
      >
        <input
          className="w-full border rounded focus:outline-none px-2 py-1 mb-10"
          type="text"
          size={50}
          placeholder="Search by address / txn hash / block number / ENS name"
          onChange={handleChange}
          autoFocus
        ></input>
        <button
          className="mx-auto px-3 py-1 mb-10 rounded bg-gray-100 hover:bg-gray-200 focus:outline-none"
          type="submit"
        >
          Search
        </button>
        <div className="mx-auto mt-5 mb-5 text-lg text-link-blue hover:text-link-blue-hover font-bold">
          <NavLink to="/special/london">
            <div className="flex space-x-2 items-baseline text-orange-500 hover:text-orange-700 hover:underline">
              <span>
                <FontAwesomeIcon icon={faBurn} />
              </span>
              <span>Check out the special dashboard for EIP-1559</span>
              <span>
                <FontAwesomeIcon icon={faBurn} />
              </span>
            </div>
          </NavLink>
        </div>
        {latestBlock && (
          <NavLink
            className="mx-auto flex flex-col items-center space-y-1 mt-5 text-sm text-gray-500 hover:text-link-blue"
            to={blockURL(latestBlock.number)}
          >
            <div>Latest block: {ethers.utils.commify(latestBlock.number)}</div>
            <Timestamp value={latestBlock.timestamp} />
          </NavLink>
        )}
      </form>
    </div>
  );
};

export default React.memo(Home);
