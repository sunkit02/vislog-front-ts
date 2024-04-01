import { type Accessor, For, type Setter, Show } from "solid-js";

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
	active: Accessor<boolean>;
	setActive: Setter<boolean>;
}) {
	return (
		<aside
			class={`${
				props.active() ? "w-full" : "w-0"
			} duration-200 bg-sky-200 rounded-tl-lg rounded-bl-lg`}
		>
			<article hidden={!props.active()}>
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
		</aside>
	);
}

export default ActiveNodeDetailsSideBar;
