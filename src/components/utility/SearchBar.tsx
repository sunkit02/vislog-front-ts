import { type Accessor, For, type Setter, createSignal } from "solid-js";

interface SearchBarProps {
	// The text that is actually being searched
	setSearchText: Setter<string>;
	// A list of potential search targets
	possibleSearches: Accessor<string[]>;
}

// TODO: Implement keyboard navigation of search list with up, down, left, and right
// TODO: Use a fuzzy search library like (fuzzysort)[https://github.com/farzher/fuzzysort]
function SearchBar(props: SearchBarProps) {
	// The text currently being typed in search bar
	const [input, setInput] = createSignal("");
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
				// console.log("article focusout");
			}}
		>
			<div
				class={`w-full rounded-t-3xl ${
					inputActive() && props.possibleSearches().length > 0
						? "bg-sky-200"
						: "bg-transparent"
				}`}
			>
				<div
					class={`flex w-full flex-row ${
						inputActive()
							? "bg-sky-200"
							: "bg-sky-100 outline outline-2 outline-sky-300"
					} rounded-b-3xl rounded-t-3xl px-5`}
				>
					<input
						onFocus={() => {
							// console.log("input focus in");
							setInputActive(true);
						}}
						ref={inputBox}
						class="w-full bg-transparent py-3 focus:outline-none"
						type="text"
						placeholder="Enter program name"
						value={input()}
						onInput={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								props.setSearchText(input());
								setInputActive(false);
								inputBox?.blur();
							} else if (e.key === "Escape") {
								setInputActive(false);
								inputBox?.blur();
							}
						}}
					/>
					<div
						class={`${
							input().length === 0 ? "hidden" : "flex"
						} h-[48px] w-[30px] items-center justify-center bg-transparent text-sky-600 hover:cursor-pointer`}
						hidden={input().length === 0}
						onKeyPress={() => {}}
						onClick={() => {
							setInput("");
							if (inputBox) {
								inputBox.focus();
							}
						}}
					>
						<svg
							class={`${
								input().length === 0 ? "hidden" : "flex"
							} h-[25px] w-[25px]`}
						>
							<title>Clear input</title>
							<path
								class="fill-sky-500"
								d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
							/>
						</svg>
					</div>
				</div>

				{/* Dividng line that only shows when `inputActive` is true */}
				<div class="flex flex-row justify-center items-center w-full z-50 h-1">
					<div
						hidden={!inputActive()}
						class="w-[98%] border-t-[1px] border-gray-400"
					/>
				</div>

				{/* Search suggestion selection menu or the "possible searches list" */}
				<ul
					tabindex={-1}
					ref={possibleSearchesListRef}
					class="absolute z-30 max-h-96 w-full overflow-x-clip overflow-y-auto rounded-b-md bg-sky-200"
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
								onKeyPress={() => {}}
								onClick={() => {
									// console.log("Clicked: ", entry);
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
