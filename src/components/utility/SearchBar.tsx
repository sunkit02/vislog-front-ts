import { Accessor, For, Setter, createSignal } from "solid-js";

interface SearchBarProps {
  setSearchText: Setter<string>;
  possibleSearches: Accessor<string[]>;
}

// TODO: Implement keyboard navigation of search list with up, down, left, and right
function SearchBar(props: SearchBarProps) {
  const [input, setInput] = createSignal("Major in Computer Science");
  const [hideSearchList, setHideSearchList] = createSignal(true);
  const [viewingSearcheList, setViewingSearchList] = createSignal(false);

  let possibleSearchesList: HTMLUListElement | undefined = undefined;

  return (
    <div
      class="w-[80vw]"
      onFocus={() => {
        console.log("wrapper div focus in");
      }}
      onFocusOut={() => {
        console.log("wrapper div focus out");
        if (!viewingSearcheList()) {
          setHideSearchList(true);
        }
      }}
    >
      <input
        onFocus={() => {
          console.log("input focus in");
          setHideSearchList(false);
        }}
        onFocusOut={() => {
          console.log("input focusout");
        }}
        class="w-full overflow-ellipsis rounded-full border-2 border-solid border-sky-300 bg-sky-100 px-10 py-3 focus:rounded-b-none focus:rounded-t-3xl focus:bg-sky-200 focus:outline-none active:outline-none"
        type="search"
        placeholder="Enter program name"
        value={input()}
        onInput={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            console.log("Enter pressed. Update search text");
            props.setSearchText(input());
          } else if (e.key === "Escape") {
            console.log("Escape pressed");
          }
        }}
      />
      <ul
        ref={possibleSearchesList}
        class="absolute z-50 max-h-96 w-[80vw] overflow-x-clip overflow-y-scroll rounded-b-md bg-sky-200 pb-1"
        onMouseEnter={() => setViewingSearchList(true)}
        onMouseLeave={() => setViewingSearchList(false)}
        hidden={hideSearchList()}
      >
        <For each={props.possibleSearches()} fallback={null}>
          {(entry) => (
            <li
              class="p-3 hover:cursor-pointer hover:bg-sky-100"
              hidden={
                // Only show when search input is empty or when matches search input
                input().length === 0 ? false : !searchMatches(entry, input())
              }
              onClick={() => {
                console.log("Clicked: ", entry);
                setInput(entry);
                props.setSearchText(entry);
                setHideSearchList(true);
              }}
            >
              {entry}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

function searchMatches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
}

export default SearchBar;
