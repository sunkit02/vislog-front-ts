import { type Accessor, For, type Setter, Show } from "solid-js";

export type ActiveNodeDetails = {
	title: string;
	url?: string;
	code?: string;
	credits?: [number, number | null];
	paragraphs: string[];
};

function ActiveNodeDetails(props: {
	details: Accessor<ActiveNodeDetails>;
	active: Accessor<boolean>;
	setActive: Setter<boolean>;
}) {
	return (
		<aside
			class={`h-full ${
				props.active() ? "" : "w-0 hidden"
			} duration-200 bg-sky-200 border-sky-200 border-r-black rounded-tl-lg rounded-bl-lg`}
		>
			<article>
				<h3>{props.details().title}</h3>
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

export default ActiveNodeDetails;
