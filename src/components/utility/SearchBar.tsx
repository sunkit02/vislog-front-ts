import { Accessor, For, Setter, createEffect, createSignal } from "solid-js";

interface SearchBarProps {
  // The text that is actually being searched
  setSearchText: Setter<string>;
  // A list of potential search targets
  possibleSearches: Accessor<string[]>;
}

// TODO: Implement keyboard navigation of search list with up, down, left, and right
function SearchBar(props: SearchBarProps) {
  // The text currently being typed in search bar
  const [input, setInput] = createSignal("Major in Computer Science");
  const [mouseOverSearchBar, setMouseOverSearchBar] = createSignal(false);
  const [inputActive, setInputActive] = createSignal(false);

  let inputBox: HTMLInputElement | undefined;
  let possibleSearchesListRef: HTMLUListElement | undefined;

  return (
    <article
      class="relative w-full"
      onMouseEnter={() => setMouseOverSearchBar(true)}
      onMouseLeave={() => setMouseOverSearchBar(false)}
      onFocusOut={() => {
        if (!mouseOverSearchBar()) {
          setInputActive(false);
        }
        console.log("article focusout");
      }}
    >
      <div class={`rounded-t-3xl ${inputActive() && props.possibleSearches().length > 0 ? "bg-sky-200" : "bg-transparent"}`}>
        <div class={`flex flex-row w-full ${inputActive() ? "bg-sky-200" : "bg-sky-100" } overflow-ellipsis rounded-t-3xl rounded-b-3xl border-2 border-solid border-sky-300 px-5 focus:border-none`}>
          <input
            onFocus={() => {
              console.log("input focus in");
              setInputActive(true);
            }}
            ref={inputBox}
            class="w-full focus:outline-none bg-transparent py-3"
            type="text"
            placeholder="Enter program name"
            value={input()}
            onInput={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                props.setSearchText(input());
                inputBox?.blur();
              } else if (e.key === "Escape") {
                inputBox?.blur();
              }
            }}
          />
          <button 
            class="h-[50px] w-[30px] bg-transparent text-sky-600 flex justify-center items-center"
            hidden={input().length === 0}
            onClick={() => {
              setInput("");
              if (inputBox) {
                inputBox.focus();
              }
            }}>
            <svg class="h-[25px] w-[25px] flex">
              <path 
                class="fill-sky-500"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              >
              </path>
            </svg>
          </button>
        </div>
        <ul
          ref={possibleSearchesListRef}
          class="absolute z-50 max-h-96 w-full overflow-x-clip overflow-y-scroll rounded-b-md bg-sky-200"
          hidden={!inputActive()}
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
                  setInputActive(false);
                }}
              >
                {entry}
              </li>
            )}
          </For>
        </ul>
      </div>
    </article>
  );
}

function searchMatches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
}

export default SearchBar;
