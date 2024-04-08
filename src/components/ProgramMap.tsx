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

// TODO: Split long list of courses into two columns
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
				class={`relative h-[80vh] w-[90vw] overflow-auto ${
				class={`relative h-[90vh] w-[90vw] overflow-auto ${
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
				class="absolute left-[2px] top-[2px] flex h-[calc(100%-4px)] flex-row] max-w-[75%]"
			>
				<ActiveNodeDetails
					containerRef={sideBarContainerRef}
					details={activeNodeDetails}
					selectedNodes={selectedNodes}
					active={showActiveNodeDetails}
					setActive={setShowActiveNodeDetails}
				/>
				<div class="relative flex h-full flex-row items-center justify-start">
					<button
						type="button"
						class="absolute left-1 top-1 m-3 h-[30px] w-[30px] shrink-0 rounded-lg p-[0.2rem] hover:border-2 hover:border-solid hover:border-black hover:bg-yellow-100"
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
		const node = new NodeInfo(null, childrenIds, nodeState);
		nodes.set(id, node);

		// Hide active node details and update its content to be consistent with current program
		setShowActiveNodeDetails(false);
		updateCurrentNodeDetails();
		setSelectedNodes([]);
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

	// NOTE: Don't touch the event propagation and set any state, only read.
	// This callback will be executed before the inner callback for onclick
	// in Node will be
	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== props.program.title),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.program.title]));
		}
	};

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
			<button type="button" onClick={() => console.log(nodes)}>
				<span class="underline hover:text-blue-600">Print</span>
			</button>
		</div>
	);

	return (
		<Node
			id={id}
			parentId={null}
			nodeContent={contents}
			state={nodeState}
			nodes={nodes}
			onClick={toggleSelectNode}
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
				<For each={(props.reqs as T.ManyRequirements).data}>
					{(reqModule) => (
						<RequirementModule
							reqModule={reqModule}
							parentId={props.parentId}
						/>
					)}
				</For>
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
	const { setShowActiveNodeDetails, setActiveNodeDetails } =
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

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.req);
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

	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== (props.req.data.title || id)),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.req.data.title || id]));
		}
	};

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
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			nodeContent={content}
			state={nodeState}
			nodes={nodes}
			onClick={toggleSelectNode}
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

	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== props.req.data.title),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.req.data.title]));
		}
	};

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);
	});

	return (
		<Node
			id={id}
			parentId={props.parentId}
			nodeContent={<h3 class="w-[80%] text-center">{props.req.data.title}</h3>}
			state={nodeState}
			nodes={nodes}
			onClick={toggleSelectNode}
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
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.rawContent);
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

	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== (props.data.title || id)),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.data.title || id]));
		}
	};

	const content = (
		<h3 class="w-[80%] text-center">{props.data.title || "Courses"}</h3>
	);

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.data);
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
			onClick={toggleSelectNode}
		>
			<div class="flex flex-col items-center justify-center gap-20">
				<For each={props.data.courses}>
					{(entry) => <CourseEntry entry={entry} parentId={id} />}
				</For>
			</div>
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

	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== props.data.title),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.data.title]));
		}
	};

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.data);
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
			onClick={toggleSelectNode}
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

	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== (props.data.title || id)),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.data.title || id]));
		}
	};

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.data);
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
			onClick={toggleSelectNode}
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
				/>
			</Match>
			<Match when={props.entry.type === T.CourseEntryType.Or}>
				<Or
					entries={(props.entry as T.Or).data}
					parentId={props.parentId}
					showArrow={props.showArrow === false ? false : true}
				/>
			</Match>
			<Match when={props.entry.type === T.CourseEntryType.Course}>
				<Course
					course={(props.entry as T.EntryCourse).data}
					parentId={props.parentId}
					showArrow={props.showArrow}
				/>
			</Match>
			<Match when={props.entry.type === T.CourseEntryType.Label}>
				<Label
					label={(props.entry as T.EntryLabel).data}
					parentId={props.parentId}
					showArrow={props.showArrow}
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
}) {
	console.log("And", props);

	const id = generateId("And");
	const nodeState = createNodeState();
	const { nodes } = useContext(ProgramMapContext);

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.entries);
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
	showArrow?: boolean;
}) {
	console.log("Or", props);

	return (
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
	);
}

function Label(props: {
	label: T.Label;
	parentId: string;
	showArrow?: boolean;
}) {
	console.log("Lable", props);

	const id = generateId(props.label.name);
	const nodeState = createNodeState();
	const { nodes, setSelectedNodes } = useContext(ProgramMapContext);

	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== props.label.name),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.label.name]));
		}
	};

	onMount(() => {
		// Add node to nodes
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.label);
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
			onClick={toggleSelectNode}
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

	const toggleSelectNode = (_: MouseEvent) => {
		if (nodeState.selected()) {
			setSelectedNodes((prev) =>
				prev.filter((title) => title !== (props.course.name || id)),
			);
		} else {
			setSelectedNodes((prev) => prev.concat([props.course.name || id]));
		}
	};

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
		const node = new NodeInfo(props.parentId, [], nodeState);
		nodes.set(id, node);

		// Add node to parent node's children
		const parentNode = nodes.get(props.parentId);
		if (!parentNode) {
			handleParentUndefined(props.parentId, props.course);
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
			onClick={toggleSelectNode}
			nodeContent={nodeContent}
		/>
	);
}

/**
 * It is assumed that there is no parent when a `null` value is explicitly assinged to `parentId`
 */
function Node(props: {
	id: string;
	nodeContent: JSXElement;
	parentId: string | null;
	nodes: ReactiveMap<string, NodeInfo>;
	state: NodeState;
	showArrow?: boolean;
	children?: JSXElement;
	/**
	 *  Action to perform when node is clicked
	 *
	 *  NOTE: Don't touch the event propagation and set any state, only read.
	 *  This callback will be executed before the inner callback for `onClick`
	 *  in `Node` will be
	 */
	onClick?: (e: MouseEvent) => void;
}): JSXElement {
	const [arrow, setArrow] = createSignal<JSXElement | undefined>(undefined);

	let nodeRef: HTMLDivElement | undefined;
	let svgRef: SVGSVGElement | undefined;

	function highlight(): boolean {
		return props.state.hoverCount() > 0 || props.state.selected();
	}

	onMount(() => {
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
				const { x, y, height: _, width } = selfBoundingRect;
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

				const endX = x + width / 2 - offsetX;
				const endY = y - offsetY;

				const arrow = (
					<CurvedArrow
						id={`${props.parentId}->${props.id}`}
						x1={startX}
						y1={startY}
						x2={endX}
						y2={endY}
						highlight={highlight}
					/>
				);

				// console.log("Hello from onMount");
				// console.log(props.parentId);

				setArrow(arrow);
			}
		}
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
		props.state.setSelected(!props.state.selected());
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
						if (!props.state.selected()) {
							updateSubTreeHoverCount((prev) => prev + 1, props.nodes);
						}
					}}
					// NOTE: Potential place for the hoverCount to get offsynce and be always lower or greater than 0.
					// Add a check if needed in the future
					onMouseLeave={() => {
						if (!props.state.selected()) {
							updateSubTreeHoverCount((prev) => prev - 1, props.nodes);
						}
					}}
					// TODO: Add contrast between nodes that are selected or parents of the currently hovered nodes and the node being hovered;
					class={`flex min-h-[120px] min-w-[250px] items-center justify-center rounded-lg border-solid transition ${
						props.state.selected() ? "border-4" : "border-2"
					} ${
						highlight()
							? "border-blue-500 bg-sky-300"
							: "border-black bg-sky-100"
					}`}
				>
					{props.nodeContent}
				</section>
			</div>
			<svg
				class="pointer-events-none absolute h-[100%] w-[100%] overflow-visible"
				ref={svgRef}
			>
				<title>Arrow betwen nodes</title>
				{arrow()}
			</svg>
			{props.children}
		</div>
	);
}

function FallbackMessage(props: { target: string }) {
	return (
		<div class="border-1 flex h-10 w-20 items-center justify-center border-solid border-red-500 bg-red-300 text-center">
			Failed to load {props.target}
		</div>
	);
}

function handleParentUndefined(parentId: string, node: unknown) {
	alert("Parent node cannot be undefined. See console for more information.");
	console.error(
		"Cannot find parent of the following:",
		node,
		`Parent id: ${parentId}`,
	);
	return;
}

export class NodeInfo {
	parentId: string | null;
	selected: boolean;
	childrenIds: string[];
	readonly nodeState: NodeState;

	constructor(
		parentId: string | null,
		childrenIds: string[],
		nodeState: NodeState,
	) {
		this.parentId = parentId;
		this.childrenIds = childrenIds;
		this.selected = false;
		this.nodeState = nodeState;
	}
}

type NodeState = {
	hoverCount: Accessor<number>;
	setHoverCount: Setter<number>;
	selected: Accessor<boolean>;
	setSelected: Setter<boolean>;
};

function createNodeState(): NodeState {
	const [hoverCount, setHoverCount] = createSignal(0);
	const [selected, setSelected] = createSignal(false);

	return { hoverCount, setHoverCount, selected, setSelected };
}

export default ProgramMap;
