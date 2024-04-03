import { type Accessor, For, type Setter, Show, createSignal } from "solid-js";

/**
 * This is meant to be on the left side
 */
export type ActiveNodeDetails = {
	title: string;
	url?: string;
	code?: string;
	credits?: [number, number | null];
	paragraphs: string[];
};

function ActiveNodeDetailsSideBar(props: {
	details: Accessor<ActiveNodeDetails>;
	// TODO: use a data structure involving unique ids and a separate display title
	selectedNodes: Accessor<string[]>;
	active: Accessor<boolean>;
	setActive: Setter<boolean>;
}) {
	const [topHeight, setTopHeight] = createSignal(null);

	return (
		<aside
			class={`${
				props.active() ? "w-full" : "w-0"
			} duration-200 bg-sky-200 rounded-tl-lg rounded-bl-lg`}
		>
			<article
				class="h-[50%] border-b-black border-b-2 px-3 py-1 overflow-y-auto"
				hidden={!props.active()}
			>
				<h3 class="text-lg font-bold text-center">{props.details().title}</h3>
				<Show
					when={props.details().paragraphs.length > 0}
					fallback={<p class="text-center">No description.</p>}
				>
					<For each={props.details().paragraphs}>
						{(paragraph) => <p>{paragraph}</p>}
					</For>
				</Show>
			</article>
			<article
				hidden={!props.active()}
				class="h-[50%] px-3 py-1 overflow-y-auto"
			>
				<h3 class="text-lg font-bold text-center">Selected Nodes</h3>
				<Show
					when={props.selectedNodes().length > 0}
					fallback={<p class="text-center">No selected nodes.</p>}
				>
					<ul class="flex flex-col justify-start items-start overflow-auto w-full p-5">
						<For each={props.selectedNodes()}>
							{(title) => (
								<li class="w-full hover:bg-sky-300 transition">{title}</li>
							)}
						</For>
					</ul>
				</Show>
			</article>
		</aside>
	);
}

export default ActiveNodeDetailsSideBar;
