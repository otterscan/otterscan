import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  FC,
  RefObject,
  memo,
  ChangeEventHandler,
} from "react";
import { RuntimeContext } from "../useRuntime";
import "./suggestions.css";

type SuggestionsDropdownProps = {
  searchRef: RefObject<HTMLInputElement>;
};

const SuggestionsDropdown: FC<SuggestionsDropdownProps> = ({ searchRef }) => {
  const suggestionsDropdownRef = useRef<HTMLDivElement>(null);
  const [matches, setMatches] = useState<[string, string][]>([]);

  const { config } = useContext(RuntimeContext);

  async function fetchMatches() {
    const text = searchRef?.current?.value;
    const response = await fetch(
      `${config?.searchSuggestionsURLPrefix}/api/search/${text}`
    );
    try {
      const matches = await response.json();
      if (matches.length > 0) {
        if (suggestionsDropdownRef.current) {
          suggestionsDropdownRef.current.classList.add("show");
        }
      }
      if (searchRef?.current?.value === text) {
        setMatches(matches);
      }
    } catch (e) {
      setMatches([]);
    }
  }

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.addEventListener("input", fetchMatches);
    }

    return () => {
      if (searchRef.current) {
        searchRef.current.removeEventListener("input", fetchMatches);
      }
    };
  }, [searchRef]);

  function handleSelectMatch([match, address]: [string, string]) {
    if (searchRef.current) {
      // Call the native setter, bypassing React's incorrect value change check
      let propDesc = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      );
      if (propDesc !== undefined && propDesc.set !== undefined) {
        propDesc.set.call(searchRef.current, address);
      }
      searchRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (suggestionsDropdownRef.current) {
      suggestionsDropdownRef.current.classList.remove("show");
    }
  }

  return (
    <div>
      <div ref={suggestionsDropdownRef} className="dropdown-content">
        {matches.length > 0 ? (
          <ul>
            {matches.map((match) => (
              <li key={match[0]}>
                <a
                  href="#"
                  onClick={() => handleSelectMatch(match)}
                  tabIndex={0}
                >
                  {match[0]}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};

export default memo(SuggestionsDropdown);
