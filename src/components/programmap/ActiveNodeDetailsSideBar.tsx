import {
	type Accessor,
	For,
	type Setter,
	Show,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";
import { getAbsoluteOffsetX } from "../../utils/get-offset";

/**
 * This is meant to be on the left side
 */
export type ActiveNodeDetails = {
	title: string;
	url?: string;
	code?: string;
	credits?: [number, number | null];
	paragraphs: string[];
	description?: string;
};

function ActiveNodeDetailsSideBar(props: {
	containerRef: HTMLDivElement | undefined;
	details: Accessor<ActiveNodeDetails>;
	// TODO: use a data structure involving unique ids and a separate display title
	selectedNodes: Accessor<string[]>;
	active: Accessor<boolean>;
	setActive: Setter<boolean>;
}) {
	const [isDragging, setIsDragging] = createSignal(false);

	const updateWidth = (e: MouseEvent) => {
		if (isDragging()) {
			const { x: mouseX, y: mouseY } = e;
			console.log(mouseX, mouseY);
			if (props.containerRef) {
				// const { x: containerX } = props.containerRef.getBoundingClientRect();
				// const containerX = props.containerRef.offsetLeft;
				// console.log("containerX", containerX);

				if (!props.containerRef.parentElement) {
					console.error("Failed to get sidebar parent.");
					return;
				}

				const containerWidth = props.containerRef.parentElement.offsetWidth;

				const containerX = getAbsoluteOffsetX(props.containerRef);

				const testDiv = document.createElement("div");
				testDiv.className = `absolute top-[100px] left-[${containerX}px] w-[10px] h-[10px] bg-black`;
				testDiv.style.left = `${containerX}px`;
				console.log("containerX:", containerX);

				document.body.appendChild(testDiv);

				let newWidth = mouseX - containerX;
				console.log("newWidth: ", newWidth);

				// Min width is 200px
				if (newWidth < 200) {
					newWidth = 200;
					// Max width is 3/4 the width of the container
				} else if (newWidth > containerWidth * 0.75) {
					newWidth = containerWidth * 0.75;
				}

				// props.containerRef.style.width = `${newWidth}px`;
				props.containerRef.style.width = `calc(${newWidth}px + 4.3rem)`;
			}
		}
	};

	const activateDragging = () => {
		setIsDragging(true);
		document.body.style.cursor = "col-resize";
	};

	const deactivateDragging = () => {
		if (isDragging()) {
			setIsDragging(false);
			document.body.style.cursor = "";
		}
	};

	onMount(() => {
		document.addEventListener("mousemove", updateWidth);
		document.addEventListener("mouseup", deactivateDragging);
	});

	onCleanup(() => {
		document.removeEventListener("mousemove", updateWidth);
		document.removeEventListener("mouseup", deactivateDragging);
	});

	return (
		<aside
			class={`${
				props.active() ? "w-full" : "w-0"
			} flex flex-row duration-200 bg-sky-200 rounded-tl-lg rounded-bl-lg`}
		>
			<div class="flex flex-col w-[calc(100%-5px)]">
				<article
					class="h-[50%] border-b-black border-b-2 px-3 py-1 overflow-y-auto"
					hidden={!props.active()}
				>
					<h3 class="text-lg font-bold text-center">{props.details().title}</h3>
					<Show when={props.details().paragraphs.length > 0}>
						<For each={props.details().paragraphs}>
							{(paragraph) => <p>{paragraph}</p>}
						</For>
					</Show>
					<Show
						when={props.details().description}
						fallback={<p class="text-center">No description.</p>}
					>
						<p innerHTML={props.details().description} />
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
			</div>
			<div
				onMouseDown={activateDragging}
				class="w-[5px] h-full bg-200 hover:cursor-col-resize"
			/>
		</aside>
	);
}

export default ActiveNodeDetailsSideBar;
