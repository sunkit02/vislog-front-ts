import {
	type Accessor,
	For,
	type JSXElement,
	Match,
	type Setter,
	Show,
	Switch,
	createSignal,
	onMount,
	useContext,
	createEffect,
} from "solid-js";
import { generateId } from "../utils/keygen";
import CurvedArrow from "./utility/CurvedArrow";
import * as T from "../types";
import { ProgramMapContext } from "./ProgramMapContext";
import type { ReactiveMap } from "@solid-primitives/map";
import ExitFullscreen from "../icons/ExitFullscreen";
import IntoFullscreen from "../icons/IntoFullscreen";
import ActiveNodeDetails from "./programmap/ActiveNodeDetailsSideBar";
import { DATA_SERVER_URL } from "../App";
import DoubleListCurvedArrow from "./utility/DoubleListCurvedArrow";

function ProgramMap(props: { program: T.Program }) {
	let pmContainerRef: HTMLDivElement | undefined;
	const [fullScreen, setFullScreen] = createSignal(false);
	const {
		selectedNodes,
		activeNodeDetails,
		showActiveNodeDetails,
		setShowActiveNodeDetails,
	} = useContext(ProgramMapContext);

	onMount(() => {
		centerProgramMap();
	});

	function centerProgramMap() {
		// Set scroll bar to center position for entire ProgramMap
		if (pmContainerRef) {
			const clientWidth = pmContainerRef.clientWidth;
			const scrollWidth = pmContainerRef.scrollWidth;
			pmContainerRef.scrollLeft = (scrollWidth - clientWidth) / 2;

			const selfWidth = pmContainerRef.clientWidth;
			const childWidth = pmContainerRef.children[0].clientWidth;

			// Center the Program using CSS property `justify-content: center`
			// if no horizontal scrolling is required
			if (childWidth < selfWidth) {
				pmContainerRef.style.setProperty("display", "flex");
				pmContainerRef.style.setProperty("justify-content", "center");
			}
		}
	}

	async function toggleFullScreen() {
		if (pmContainerRef) {
			if (fullScreen()) {
				pmContainerRef.style.removeProperty("position");
				pmContainerRef.style.removeProperty("top");
				pmContainerRef.style.removeProperty("left");
				pmContainerRef.style.removeProperty("width");
				pmContainerRef.style.removeProperty("height");
			} else {
				pmContainerRef.style.setProperty("position", "absolute");
				pmContainerRef.style.setProperty("top", "0");
				pmContainerRef.style.setProperty("left", "0");
				pmContainerRef.style.setProperty("width", "100vw");
				pmContainerRef.style.setProperty("height", "100vh");
			}

			setFullScreen((prev) => !prev);
		} else {
			alert("Failed to fullscreen, `pmContainerRef` is undefined");
		}
	}

	let sideBarContainerRef: HTMLDivElement | undefined;

	return (
		<div class={`transition ${fullScreen() ? "" : "relative"}`}>
			<article
				ref={pmContainerRef}
				class={`relative h-[88vh] w-[90vw] overflow-auto ${
					fullScreen() ? "" : "rounded-lg border-2 border-solid border-black"
				} bg-yellow-50 p-5`}
			>
				<Program program={props.program} />
			</article>

			{/* The following div wrapper is `justify-end flex-col-reverse` when */}
			{/* `showActiveNodeDetails() == false` to ensure the fullscreen button is on top */}
			<div
				ref={sideBarContainerRef}
				id="left-aside-container"
				class={`flex-row] absolute left-[2px] top-[2px] flex h-[calc(100%-4px)] max-w-[75%] ${
					!showActiveNodeDetails() ? "pointer-event-none" : ""
				} z-10`}
			>
				<ActiveNodeDetails
					containerRef={sideBarContainerRef}
					details={activeNodeDetails}
					selectedNodes={() => Array.from(selectedNodes().values())}
					active={showActiveNodeDetails}
					setActive={setShowActiveNodeDetails}
				/>
				<div class="relative flex h-full flex-row items-center justify-start">
					<button
						type="button"
						class="pointer-event-auto absolute left-1 top-1 m-3 h-[30px] w-[30px] shrink-0 rounded-lg p-[0.2rem] hover:border-2 hover:border-solid hover:border-black hover:bg-yellow-100"
						onClick={toggleFullScreen}
					>
						{fullScreen() ? <ExitFullscreen /> : <IntoFullscreen />}
					</button>
					<button
						type="button"
						class="h-20 w-4 rounded-br-lg rounded-tr-lg border-b-black border-r-black border-t-black bg-sky-200 transition hover:bg-sky-300"
						onClick={() => setShowActiveNodeDetails((prev) => !prev)}
					>
						{showActiveNodeDetails() ? "<" : ">"}
					</button>
				</div>
			</div>
		</div>
	);
}

function Program(props: { program: T.Program }) {
	console.log("Program", props.program);
	const {
		nodes,
		setSelectedNodes,
		setShowActiveNodeDetails,
		setActiveNodeDetails,
	} = useContext(ProgramMapContext);
	const nodeState = createNodeState();
	const id = generateId(props.program.title);

	onMount(() => {
		nodes.clear();

		// Add node to nodes
		const childrenIds: string[] = [];
		const node = new NodeInfo(id, null, childrenIds, nodeState);
		nodes.set(id, node);

		// Hide active node details and update its content to be consistent with current program
		setShowActiveNodeDetails(false);
		updateCurrentNodeDetails();
		setSelectedNodes(new Set<string>());
	});

	const updateCurrentNodeDetails = () => {
		let description = "";
		if (props.program.content) {
			description += props.program.content;
		}
		if (props.program.bottomContent) {
			description += props.program.bottomContent;
		}

		setActiveNodeDetails({
			title: props.program.title,
			paragraphs: [],
			description,
		});
	};

	const showCurrentNodeDetails = (e: MouseEvent) => {
		e.stopPropagation();
		updateCurrentNodeDetails();

		setShowActiveNodeDetails(true);
	};

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.program.title || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.program.title || id);
				return new Set(prev);
			});
		}
	});

	const contents = (
		<div class="flex flex-col items-center justify-center">
			<h3 class="w-[80%] overflow-ellipsis text-center">
				{props.program.title}
			</h3>
			<a
				href={props.program.url}
				rel="noreferrer"
				target="_blank"
				class="underline hover:text-blue-600"
			>
				Link to Catalog
			</a>
			<button type="button" onClick={showCurrentNodeDetails}>
				<span class="underline hover:text-blue-600">Show details</span>
			</button>
			{/*
        <button type="button" onClick={() => console.log(nodes)}>
          <span class="underline hover:text-blue-600">Print</span>
        </button>
      */}
		</div>
	);

	return (
		<Node
			id={id}
			parentId={null}
			nodeContent={contents}
			state={nodeState}
			nodes={nodes}
		>
			<Switch fallback={<FallbackMessage target="Program" />}>
				<Match when={props.program.requirements}>
					{(reqs) => <Requirements reqs={reqs()} parentId={id} />}
				</Match>
				<Match when={props.program.requirements === null}>
					<div class="text-center">No Requirements Listed</div>
				</Match>
			</Switch>
		</Node>
	);
}

function Requirements(props: { reqs: T.Requirements; parentId: string }) {
	console.log("Requirements", props.reqs);
	return (
		<Switch>
			<Match when={props.reqs.type === T.RequirementsType.Single}>
				<RequirementModule
					reqModule={(props.reqs as T.SingleRequirement).data}
					parentId={props.parentId}
				/>
			</Match>
			<Match when={props.reqs.type === T.RequirementsType.Many}>
				<ul class="flex flex-row">
					<For each={(props.reqs as T.ManyRequirements).data}>
						{(reqModule) => (
							<RequirementModule
								reqModule={reqModule}
								parentId={props.parentId}
							/>
						)}
					</For>
				</ul>
			</Match>
		</Switch>
	);
}

function RequirementModule(props: {
	reqModule: T.RequirementModule;
	parentId: string;
}) {
	console.log("RequirementModule", props);
	return (
		<Switch>
			<Match
				when={
					props.reqModule.type ===
					T.RequirementModuleType.SingleBasicRequirement
				}
			>
				<SingleBasicRequirement
					req={props.reqModule as T.SingleBasicRequirement}
					parentId={props.parentId}
				/>
			</Match>
			<Match
				when={
					props.reqModule.type === T.RequirementModuleType.BasicRequirements
				}
			>
				<BasicRequirements
					req={props.reqModule as T.BasicRequirements}
					parentId={props.parentId}
				/>
			</Match>
			<Match
				when={
					props.reqModule.type === T.RequirementModuleType.SelectOneEmphasis
				}
			>
				<Unimplemented rawContent={props.reqModule} parentId={props.parentId} />
			</Match>
			<Match when={props.reqModule.type === T.RequirementModuleType.Label}>
				<ModuleLabel
					req={props.reqModule as T.ModuleLabel}
					parentId={props.parentId}
				/>
			</Match>
			<Match
				when={props.reqModule.type === T.RequirementModuleType.Unimplemented}
			>
				<Unimplemented rawContent={props.reqModule} parentId={props.parentId} />
			</Match>
		</Switch>
	);
}

function SingleBasicRequirement(props: {
	req: T.SingleBasicRequirement;
	parentId: string;
}) {
	console.log("SingleBasicRequirement", props);

	const id = generateId(props.req.data.title || "SingleBasicRequirement");
	const { setShowActiveNodeDetails, setActiveNodeDetails, setSelectedNodes } =
		useContext(ProgramMapContext);

	const showCurrentNodeDetails = (e: MouseEvent) => {
		e.stopPropagation();
		setActiveNodeDetails({
			title: props.req.data.title || "No Title",
			paragraphs: [`Parent id: ${props.parentId}`],
		});

		setShowActiveNodeDetails(true);
	};

	const content = (
		<>
			<h3 class="w-[80%] text-center">{props.req.data.title}</h3>
			<button type="button" onClick={showCurrentNodeDetails}>
				<span class="underline hover:text-blue-600">Show details</span>
			</button>
		</>
	);
	const { nodes } = useContext(ProgramMapContext);
	const nodeState = createNodeState();

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.req.data.title || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.req.data.title || id);
				return new Set(prev);
			});
		}
	});

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(
				props.parentId,
				props.req.data.title || "SingleBasicRequirement: No Title",
				props.req,
			);
			return;
		}
		const newParentNode = { ...parentNode };
		newParentNode.childrenIds = [...newParentNode.childrenIds, id];
		nodes.set(props.parentId, newParentNode);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			nodeContent={content}
			state={nodeState}
			nodes={nodes}
		>
			<Requirement req={props.req.data.requirement} parentId={id} />
		</Node>
	);
}

function BasicRequirements(props: {
	req: T.BasicRequirements;
	parentId: string;
}) {
	console.log("BasicRequirements", props);
	// console.log("BasicRequirements title", props.req.data.title);
	const id = generateId(props.req.data.title || "SingleBasicRequirement");
	const {
		nodes,
		setShowActiveNodeDetails,
		setActiveNodeDetails,
		setSelectedNodes,
	} = useContext(ProgramMapContext);
	const nodeState = createNodeState();

	const showCurrentNodeDetails = (e: MouseEvent) => {
		e.stopPropagation();
		setActiveNodeDetails({
			title: props.req.data.title || "No Title",
			paragraphs: [`Parent id: ${props.parentId}`],
		});

		setShowActiveNodeDetails(true);
	};

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.req.data.title || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.req.data.title || id);
				return new Set(prev);
			});
		}
	});

	const content = (
		<div class="flex flex-col items-center justify-center">
			<h3 class="w-[80%] text-center">{props.req.data.title}</h3>
			<button type="button" onClick={showCurrentNodeDetails}>
				<span class="underline hover:text-blue-600">Show details</span>
			</button>
		</div>
	);

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			nodeContent={content}
			state={nodeState}
			nodes={nodes}
		>
			<div class="flex flex-row items-start justify-center">
				<For each={props.req.data.requirements}>
					{(req) => <Requirement req={req} parentId={id} />}
				</For>
			</div>
		</Node>
	);
}

function ModuleLabel(props: { req: T.ModuleLabel; parentId: string }) {
	console.log("ModuleLabel", props);

	const id = generateId(props.req.data.title);
	const nodeState = createNodeState();
	const { nodes, setSelectedNodes } = useContext(ProgramMapContext);

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.req.data.title);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.req.data.title);
				return new Set(prev);
			});
		}
	});

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			nodeContent={<h3 class="w-[80%] text-center">{props.req.data.title}</h3>}
			state={nodeState}
			nodes={nodes}
		/>
	);
}

function Unimplemented(props: { rawContent: unknown; parentId: string }) {
	console.log("Unimplemented", props);

	const id = generateId("Unimplemented");
	const nodeState = createNodeState();
	const { nodes } = useContext(ProgramMapContext);

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, "Unimplemented", props.rawContent);
			return;
		}
		parentNode.childrenIds.push(id);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			state={nodeState}
			nodes={nodes}
			nodeContent={
				<div class="flex flex-col items-center justify-center p-5">
					<h3 class="w-[80%] text-center">Unimplemented</h3>
					<button
						type="button"
						class="rounded-md bg-blue-300 px-5 py-3"
						onClick={() => {
							console.log(`RawContent for Node with id: ${id}`);
							console.log(JSON.stringify(props.rawContent, null, 4));
						}}
					>
						Console Log Raw Content
					</button>
				</div>
			}
		/>
	);
}

function Requirement(props: { req: T.Requirement; parentId: string }) {
	console.log("Requirement", props);
	return (
		<Switch>
			<Match when={props.req.type === T.RequirementType.Courses}>
				<Courses
					data={(props.req as T.Courses).data}
					parentId={props.parentId}
				/>
			</Match>
			<Match when={props.req.type === T.RequirementType.SelectFromCourses}>
				<SelectFromCourses
					data={(props.req as T.SelectFromCourses).data}
					parentId={props.parentId}
				/>
			</Match>
			<Match when={props.req.type === T.RequirementType.Label}>
				<RequirementLabel
					data={(props.req as T.RequirementLabel).data}
					parentId={props.parentId}
				/>
			</Match>
		</Switch>
	);
}

function Courses(props: {
	data: { title: string | null; courses: T.CourseEntry[] };
	parentId: string;
}) {
	console.log("Courses", props);

	const id = generateId(props.data.title || "Courses");
	const nodeState = createNodeState();
	const { nodes, setSelectedNodes } = useContext(ProgramMapContext);

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.data.title || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.data.title || id);
				return new Set(prev);
			});
		}
	});

	const content = (
		<>
			<h3 class="w-[80%] text-center">{props.data.title || "Courses"}</h3>
		</>
	);

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(
				props.parentId,
				props.data.title || "Courses: No Title",
				props.data,
			);
			return;
		}
		parentNode.childrenIds.push(id);
	});

	return (
		<Node
			id={id}
			nodeContent={content}
			parentId={props.parentId}
			state={nodeState}
			nodes={nodes}
		>
			<DoubleCourseList parentId={id} courses={props.data.courses} />
		</Node>
	);
}

function SelectFromCourses(props: {
	data: { title: string; courses: T.CourseEntry[] | null };
	parentId: string;
}) {
	console.log("SelectFromCourses", props);

	const id = generateId(props.data.title);
	const nodeState = createNodeState();
	const { nodes, setSelectedNodes } = useContext(ProgramMapContext);

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.data.title || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.data.title || id);
				return new Set(prev);
			});
		}
	});

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.data.title, props.data);
			return;
		}
		parentNode.childrenIds.push(id);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			state={nodeState}
			nodes={nodes}
			nodeContent={
				<div class="flex flex-col items-center justify-center gap-5">
					<h3 class="w-[80%] text-center">{props.data.title}</h3>
					<Show when={props.data.courses} fallback={<p>No courses listed.</p>}>
						{(entries) =>
							entries().map((entry) => (
								<CourseEntry entry={entry} parentId={id} showArrow={false} />
							))
						}
					</Show>
				</div>
			}
		/>
	);
}

function RequirementLabel(props: {
	data: { title: string | null; reqNarrative: string | null };
	parentId: string;
}) {
	console.log("RequirementLabel", props);

	const id = generateId(props.data.title || "RequirementLabel");
	const nodeState = createNodeState();
	const { nodes, setSelectedNodes } = useContext(ProgramMapContext);

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.data.title || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.data.title || id);
				return new Set(prev);
			});
		}
	});

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(
				props.parentId,
				props.data.title || "RequirementLabel: No Title",
				props.data,
			);
			return;
		}
		parentNode.childrenIds.push(id);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			state={nodeState}
			nodes={nodes}
			nodeContent={
				<>
					<h3 class="w-[80%] text-center">{props.data.title}</h3>
					<p>{props.data.reqNarrative}</p>
				</>
			}
		/>
	);
}

function CourseEntry(props: {
	entry: T.CourseEntry;
	parentId: string;
	isNested?: boolean;
	showArrow?: boolean;
	doubleListSide?: "left" | "right";
}) {
	console.log("CourseEntry", props);

	return (
		<Switch>
			<Match when={props.entry.type === T.CourseEntryType.And}>
				<And
					entries={(props.entry as T.And).data}
					parentId={props.parentId}
					isNested={props.isNested}
					showArrow={props.showArrow}
					doubleListSide={props.doubleListSide}
				/>
			</Match>
			<Match when={props.entry.type === T.CourseEntryType.Or}>
				<Or
					entries={(props.entry as T.Or).data}
					parentId={props.parentId}
					showArrow={props.showArrow === false ? false : true}
					doubleListSide={props.doubleListSide}
				/>
			</Match>
			<Match when={props.entry.type === T.CourseEntryType.Course}>
				<Course
					course={(props.entry as T.EntryCourse).data}
					parentId={props.parentId}
					showArrow={props.showArrow}
					doubleListSide={props.doubleListSide}
				/>
			</Match>
			<Match when={props.entry.type === T.CourseEntryType.Label}>
				<Label
					label={(props.entry as T.EntryLabel).data}
					parentId={props.parentId}
					showArrow={props.showArrow}
					doubleListSide={props.doubleListSide}
				/>
			</Match>
		</Switch>
	);
}

function And(props: {
	entries: T.CourseEntry[];
	isNested?: boolean;
	parentId: string;
	showArrow?: boolean;
	doubleListSide?: "left" | "right";
}) {
	console.log("And", props);

	const id = generateId("And");
	const nodeState = createNodeState();
	const { nodes } = useContext(ProgramMapContext);

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, "And", props.entries);
			return;
		}
		parentNode.childrenIds.push(id);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			state={nodeState}
			nodes={nodes}
			showArrow={props.showArrow}
			doubleListSide={props.doubleListSide}
			nodeContent={
				<div class="flex flex-col items-center justify-center gap-5 p-5">
					<h3 class="w-[80%] text-center">And</h3>
					<div
						class={`flex ${
							props.entries.length <= 3 && props.isNested === false
								? "flex-row"
								: "flex-col"
						} items-center justify-center gap-5`}
					>
						<For each={props.entries}>
							{(entry) => (
								<CourseEntry
									entry={entry}
									isNested={true}
									parentId={id}
									showArrow={false}
								/>
							)}
						</For>
					</div>
				</div>
			}
		/>
	);
}

// TODO: Display different options as horizontal branches of the program map
function Or(props: {
	entries: T.CourseEntry[];
	parentId: string;
	isNested?: boolean;
	showArrow?: boolean;
	doubleListSide?: "left" | "right";
}) {
	console.log("Or", props);

	const id = generateId("Or");
	const nodeState = createNodeState();
	const { nodes } = useContext(ProgramMapContext);

	onMount(() => {
		// Only register the Or in nodes if is part of a `DoubleCoursesList`
		if (props.doubleListSide) {
			// Add node to nodes
			const node = new NodeInfo(id, props.parentId, [], nodeState);
			nodes.set(id, node);

			// Add node to parent node's children
			const parentNode = nodes.get(props.parentId);
			if (!parentNode) {
				handleParentUndefined(props.parentId, "And", props.entries);
				return;
			}
			parentNode.childrenIds.push(id);
		}
	});

	return (
		<Switch>
			{/* Or element not in a `DoubleCoursesList` */}
			<Match when={props.doubleListSide === undefined}>
				<div class="flex flex-row gap-5">
					<For each={props.entries}>
						{(entry) => (
							<CourseEntry
								entry={entry}
								isNested={true}
								parentId={props.parentId}
								showArrow={props.showArrow}
							/>
						)}
					</For>
				</div>
			</Match>
			{/* Or element is in a `DoubleCoursesList` */}
			<Match when={props.doubleListSide !== undefined}>
				<Node
					id={id}
					parentId={props.parentId}
					state={nodeState}
					nodes={nodes}
					showArrow={props.showArrow}
					showHoverEffect={false}
					doubleListSide={props.doubleListSide}
					nodeContent={
						<div class="flex flex-col items-center justify-center gap-5 p-5">
							<h3 class="w-[80%] text-center">Or</h3>
							<div
								class={`flex ${
									props.entries.length <= 3 && props.isNested === false
										? "flex-row"
										: "flex-col"
								} items-center justify-center gap-5`}
							>
								<For each={props.entries}>
									{(entry) => (
										<CourseEntry
											entry={entry}
											isNested={true}
											parentId={id}
											showArrow={false}
										/>
									)}
								</For>
							</div>
						</div>
					}
				/>
			</Match>
		</Switch>
	);
}

function Label(props: {
	label: T.Label;
	parentId: string;
	showArrow?: boolean;
	doubleListSide?: "left" | "right";
}) {
	console.log("Lable", props);

	const id = generateId(props.label.name);
	const nodeState = createNodeState();
	const { nodes, setSelectedNodes } = useContext(ProgramMapContext);

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.label.name || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.label.name || id);
				return new Set(prev);
			});
		}
	});

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.label.name, props.label);
			return;
		}
		parentNode.childrenIds.push(id);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			state={nodeState}
			nodes={nodes}
			showArrow={props.showArrow}
			doubleListSide={props.doubleListSide}
			nodeContent={
				<>
					<h3 class="w-[80%] text-center">{props.label.name}</h3>
				</>
			}
		/>
	);
}

function Course(props: {
	course: T.Course;
	parentId: string;
	showArrow?: boolean;
	doubleListSide?: "left" | "right";
}) {
	console.log("Course", props);

	const id = generateId(props.course.name || "Course");
	const nodeState = createNodeState();
	const {
		nodes,
		setShowActiveNodeDetails,
		setActiveNodeDetails,
		setSelectedNodes,
	} = useContext(ProgramMapContext);

	createEffect(() => {
		if (nodeState.directlySelected() || nodeState.childSelectedCount() > 0) {
			setSelectedNodes((prev) => {
				prev.add(props.course.name || id);
				return new Set(prev);
			});
		} else {
			setSelectedNodes((prev) => {
				prev.delete(props.course.name || id);
				return new Set(prev);
			});
		}
	});

	const showCurrentNodeDetails = async (e: MouseEvent) => {
		e.stopPropagation();
		const courseDetails: T.CourseDetails = await fetch(
			`${DATA_SERVER_URL}/api/courses/${props.course.guid}`,
		).then((res) => res.json());

		console.log(courseDetails);

		setActiveNodeDetails({
			title: props.course.name || "No Title",
			url: props.course.url,
			paragraphs: [
				`${props.course.subject_code}-${props.course.number}`,
				`GUID: ${props.course.guid}`,
				props.course.credits[1] !== null
					? `Credits: ${props.course.credits[0]}-${props.course.credits[1]} hours`
					: `Credits: ${props.course.credits[0]} hours`,
			],
			description: courseDetails.description,
		});

		setShowActiveNodeDetails(true);
	};

	const nodeContent = (
		<div class="flex flex-col items-center justify-center">
			<h3 class="w-[80%] text-center">
				{props.course.name || `Course: ${props.course.guid}`}
			</h3>
			<a
				href={props.course.url}
				rel="noreferrer"
				target="_blank"
				class="underline hover:text-blue-600"
			>
				Link to Course
			</a>
			<button type="button" onClick={showCurrentNodeDetails}>
				<span class="underline hover:text-blue-600">Show details</span>
			</button>
		</div>
	);

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(id, props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(
				props.parentId,
				`Course: ${props.course.name}`,
				props.course,
			);
			return;
		}
		parentNode.childrenIds.push(id);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			showArrow={props.showArrow}
			state={nodeState}
			nodes={nodes}
			nodeContent={nodeContent}
			doubleListSide={props.doubleListSide}
		/>
	);
}

type NodeProps = {
	id: string;
	nodeContent: JSXElement;
	parentId: string | null;
	nodes: ReactiveMap<string, NodeInfo>;
	state: NodeState;
	showArrow?: boolean;
	/**
	 * Whether or to show the mouse hover effect (logical highlighting of parents will not be affected)
	 */
	showHoverEffect?: boolean;
	children?: JSXElement;
	/**
	 * Which side of the `DoubleCourseList` this node is on. Is not in a `DoubleCourseList` if `undefined`
	 */
	doubleListSide?: "left" | "right";
	/**
	 *  Action to perform when node is clicked
	 *
	 *  NOTE: Don't touch the event propagation and set any state, only read.
	 *  This callback will be executed before the inner callback for `onClick`
	 *  in `Node` will be
	 */
	onClick?: (e: MouseEvent) => void;
};

/**
 * It is assumed that there is no parent when a `null` value is explicitly assinged to `parentId`
 */
function Node(props: NodeProps): JSXElement {
	const [arrow, setArrow] = createSignal<JSXElement | undefined>(undefined);

	let nodeRef: HTMLDivElement | undefined;
	let svgRef: SVGSVGElement | undefined;

	function nodeIsSelected(): boolean {
		const nodeInfo = props.nodes.get(props.id);
		if (nodeInfo) {
			return (
				nodeInfo.nodeState.directlySelected() ||
				nodeInfo.nodeState.childSelectedCount() > 0
			);
		}
		return false;
	}

	function shouldHighlight(): boolean {
		return props.state.hoverCount() > 0 || nodeIsSelected();
	}

	function renderArrowToParent() {
		if (!props.parentId) {
			console.log(`Node with id ${props.id} doesn't have a parentId`);
			return;
		}

		if (props.showArrow !== false) {
			const parentNode = document.getElementById(props.parentId);
			const parentBoundingRect = parentNode?.getBoundingClientRect();
			const selfBoundingRect = nodeRef?.getBoundingClientRect();
			const svgBoundingRect = svgRef?.getBoundingClientRect();

			// console.log("parentBoundingRect", parentBoundingRect);
			// console.log("selfBoundingRect", selfBoundingRect);
			// console.log("svgBoundingRect", svgBoundingRect);

			if (selfBoundingRect && parentBoundingRect && svgBoundingRect) {
				const { x, y, height, width } = selfBoundingRect;
				// console.log({ x, y, height, width });

				const {
					x: parentX,
					y: parentY,
					height: parentHeight,
					width: parentWidth,
				} = parentBoundingRect;
				// console.log({ parentX, parentY, parentHeight, parentWidth });

				const { x: offsetX, y: offsetY } = svgBoundingRect;
				// console.log({ offsetX, offsetY });

				const startX = parentX + parentWidth / 2 - offsetX;
				const startY = parentY + parentHeight - offsetY;

				let endX: number;
				let endY: number;

				if (props.doubleListSide === "left") {
					// Middle right of Node
					// +--------+
					// |  Node  |<-
					// +--------+
					endX = x + width - offsetX;
					endY = y + height / 2 - offsetY;
				} else if (props.doubleListSide === "right") {
					// Middle left of Node
					//   +--------+
					// ->|  Node  |
					//   +--------+
					endX = x - offsetX;
					endY = y + height / 2 - offsetY;
				} else {
					// This means that the Node is not in a `DoubleCoursesList`
					// Top middle of Node
					//
					//     v
					// +--------+
					// |  Node  |
					// +--------+
					endX = x + width / 2 - offsetX;
					endY = y - offsetY;
				}

				const arrow = props.doubleListSide ? (
					<DoubleListCurvedArrow
						id={`${props.parentId}->${props.id}`}
						x1={startX}
						y1={startY}
						curveStartX={parentX + parentWidth / 2 - offsetX}
						curveStartY={y - offsetY}
						x2={endX}
						y2={endY}
						highlight={shouldHighlight}
						doubleListSide={props.doubleListSide}
					/>
				) : (
					<CurvedArrow
						id={`${props.parentId}->${props.id}`}
						x1={startX}
						y1={startY}
						x2={endX}
						y2={endY}
						highlight={shouldHighlight}
					/>
				);

				// console.log("Hello from onMount");
				// console.log(props.parentId);

				setArrow(arrow);
			}
		}
	}

	// TODO: Optimize away the initial render so the arrows are only rendered once
	createEffect(() => {
		props.nodes.get(props.id)?.nodeState.updateArrowsTrigger();
		// TODO: Update all nodes that are affected
		props.nodes.get(props.id)?.nodeState.directlySelected();
		console.debug("Triggered an arrow update!!!!");

		renderArrowToParent();
	});

	onMount(() => {
		// Trigger arrow update to redraw all arrows after adjusting program map
		props.nodes.get(props.id)?.nodeState.setUpdateArrowsTrigger((p) => !p);
	});

	// Updates the hovercount of the current node and all of its parents
	function updateSubTreeHoverCount(
		updateFn: (prev: number) => number,
		nodes: ReactiveMap<string, NodeInfo>,
	) {
		// Update current node's hover count
		props.state.setHoverCount(updateFn);

		let parentId: string | null = props.parentId;
		while (parentId) {
			const parentNode = nodes.get(parentId);
			if (!parentNode) {
				console.error(
					`Node with id ${parentId} was not found in the node tree.`,
				);
				return;
			}
			parentNode.nodeState.setHoverCount(updateFn);
			parentId = parentNode.parentId;
		}
	}

	/**
	 * Selection and hover highlight interaction logic:
	 * 1. If current node is highlighted, do not update it's hoverCount directly
	 *   - Updates propagated from children are still allowed because it should never cause the hoverCount to drop under 1, hence holding the highlight.
	 */
	function handleClickNode(e: MouseEvent) {
		// Invoke actions passed in from parent
		props.onClick?.(e);

		e.stopPropagation();
		updateSelected(props.nodes, !props.state.directlySelected());
	}

	// Update the childSelected state of all the current node's parents and the
	// current node's `directlySelected`  state
	function updateSelected(
		nodes: ReactiveMap<string, NodeInfo>,
		isSelected: boolean,
	) {
		// Set the current node's `directlySelected` state
		props.state.setDirectlySelected(isSelected);

		// Set all parents' `childSelected` state
		let parentId: string | null = props.parentId;
		while (parentId) {
			const parentNode = nodes.get(parentId);
			if (!parentNode) {
				console.error(
					`Node with id ${parentId} was not found in the node tree.`,
				);
				return;
			}
			parentNode.nodeState.setChildSelectedCount((prev) =>
				isSelected ? prev + 1 : prev - 1,
			);
			parentId = parentNode.parentId;
		}
	}

	return (
		<div class="node-container relative flex w-max flex-shrink-0 flex-col gap-y-20 p-10">
			<div class="section-container flex flex-row items-center justify-center">
				<section
					id={props.id}
					ref={nodeRef}
					onKeyPress={() => {}}
					onClick={handleClickNode}
					onMouseEnter={() => {
						if (!nodeIsSelected()) {
							updateSubTreeHoverCount((prev) => prev + 1, props.nodes);
						}
					}}
					// NOTE: Potential place for the hoverCount to get offsynce and be always lower or greater than 0.
					// Add a check if needed in the future
					onMouseLeave={() => {
						if (!nodeIsSelected()) {
							updateSubTreeHoverCount((prev) => prev - 1, props.nodes);
						}
					}}
					// TODO: Add contrast between nodes that are selected or parents of the currently hovered nodes and the node being hovered;
					class={`flex min-h-[120px] min-w-[250px] items-center justify-center rounded-lg border-solid transition ${
						nodeIsSelected() && props.showHoverEffect !== false
							? "border-4"
							: "border-2"
					} ${
						shouldHighlight() && props.showHoverEffect !== false
							? "border-blue-500 bg-sky-300"
							: "border-black bg-sky-100"
					}`}
				>
					{props.nodeContent}
				</section>
			</div>
			<svg
				class={`pointer-events-none absolute h-[100%] w-[100%] overflow-visible ${
					shouldHighlight() ? "z-10" : ""
				}`}
				ref={svgRef}
			>
				<title>Arrow betwen nodes</title>
				{arrow()}
			</svg>
			{props.children}
		</div>
	);
}

function DoubleCourseList(props: {
	parentId: string;
	courses: T.CourseEntry[];
}) {
	const [leftList, _setLeftList] = createSignal(
		props.courses.filter((_, idx) => idx % 2 === 0),
	);
	const [rightList, _setRightList] = createSignal(
		props.courses.filter((_, idx) => idx % 2 !== 0),
	);

	// The padding is used to align the gap between the two lists
	// to the center of the parent node
	const [paddingWidth, setPaddingWidth] = createSignal(0);
	const padding = <div id="padding" style={{ width: `${paddingWidth()}px` }} />;

	const [leftListWidth, setLeftListWidth] = createSignal(0);
	const [rightListWidth, setRightListWidth] = createSignal(0);

	let leftListRef: HTMLUListElement | undefined;
	let rightListRef: HTMLUListElement | undefined;

	onMount(() => {
		if (leftListRef && rightListRef) {
			const { width: leftWidth } = leftListRef.getBoundingClientRect();
			const { width: rightWidth } = rightListRef.getBoundingClientRect();

			setLeftListWidth(leftWidth);
			setRightListWidth(rightWidth);
			// The difference between the two widths
			setPaddingWidth(Math.abs(leftWidth - rightWidth));
		}
	});

	return (
		<Switch fallback={<FallbackMessage target="DuoCourseList" />}>
			<Match when={props.courses.length > 1}>
				<div class="flex flex-row items-start justify-center">
					{leftListWidth() < rightListWidth() ? padding : null}
					<ul
						class="flex flex-col items-end justify-center gap-20"
						ref={leftListRef}
					>
						<For each={leftList()}>
							{(entry) => (
								<CourseEntry
									entry={entry}
									parentId={props.parentId}
									doubleListSide="left"
								/>
							)}
						</For>
					</ul>
					<ul
						class="flex flex-col items-start justify-center gap-20"
						ref={rightListRef}
					>
						<For each={rightList()}>
							{(entry) => (
								<CourseEntry
									entry={entry}
									parentId={props.parentId}
									doubleListSide="right"
								/>
							)}
						</For>
					</ul>
					{leftListWidth() > rightListWidth() ? padding : null}
				</div>
			</Match>
			<Match when={props.courses.length <= 1}>
				<div class="flex flex-col items-center justify-center gap-20">
					<For each={props.courses}>
						{(entry) => <CourseEntry entry={entry} parentId={props.parentId} />}
					</For>
				</div>
			</Match>
		</Switch>
	);
}

function FallbackMessage(props: { target: string }) {
	return (
		<div class="border-1 flex h-10 w-20 items-center justify-center border-solid border-red-500 bg-red-300 text-center">
			Failed to load {props.target}
		</div>
	);
}

function handleParentUndefined(
	parentId: string,
	context: string,
	node: unknown,
) {
	alert("Parent node cannot be undefined. See console for more information.");
	console.error(
		"Cannot find parent of the following:",
		node,
		`Parent id: ${parentId}`,
		`Context: ${context}`,
	);
	return;
}

export class NodeInfo {
	id: string;
	parentId: string | null;
	selected: boolean;
	childrenIds: string[];
	readonly nodeState: NodeState;

	constructor(
		id: string,
		parentId: string | null,
		childrenIds: string[],
		nodeState: NodeState,
	) {
		this.id = id;
		this.parentId = parentId;
		this.childrenIds = childrenIds;
		this.selected = false;
		this.nodeState = nodeState;
	}
}

type NodeState = {
	hoverCount: Accessor<number>;
	setHoverCount: Setter<number>;
	directlySelected: Accessor<boolean>;
	setDirectlySelected: Setter<boolean>;
	childSelectedCount: Accessor<number>;
	setChildSelectedCount: Setter<number>;
	/**
	 * Used to trigger arrow updates in a `createEffect` signal.
	 * Simply flip the boolean value back and forth using
	 * `setUpdateArrowsTrigger` to trigger an update
	 */
	updateArrowsTrigger: Accessor<boolean>;
	setUpdateArrowsTrigger: Setter<boolean>;
};

function createNodeState(): NodeState {
	const [hoverCount, setHoverCount] = createSignal(0);
	const [directlySelected, setDirectlySelected] = createSignal(false);
	const [childSelectedCount, setChildSelectedCount] = createSignal(0);
	const [updateArrowsTrigger, setUpdateArrowsTrigger] = createSignal(true);

	return {
		hoverCount,
		setHoverCount,
		directlySelected,
		setDirectlySelected,
		childSelectedCount,
		setChildSelectedCount,
		updateArrowsTrigger,
		setUpdateArrowsTrigger,
	};
}

export default ProgramMap;
