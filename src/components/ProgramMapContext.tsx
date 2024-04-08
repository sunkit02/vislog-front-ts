import { ReactiveMap } from "@solid-primitives/map";
import {
	type JSXElement,
	createContext,
	type Accessor,
	type Setter,
	createSignal,
} from "solid-js";
import type { NodeInfo } from "./ProgramMap";
import type { ActiveNodeDetails } from "./programmap/ActiveNodeDetailsSideBar";

export type ProgramMapContextType = {
	nodes: ReactiveMap<string, NodeInfo>;
	selectedNodes: Accessor<Set<string>>;
	setSelectedNodes: Setter<Set<string>>;
	activeNodeDetails: Accessor<ActiveNodeDetails>;
	setActiveNodeDetails: Setter<ActiveNodeDetails>;
	showActiveNodeDetails: Accessor<boolean>;
	setShowActiveNodeDetails: Setter<boolean>;
};

const [selectedNodes, setSelectedNodes] = createSignal<Set<string>>(new Set());
const [showActiveNodeDetails, setShowActiveNodeDetails] = createSignal(false);
const [activeNodeDetails, setActiveNodeDetails] =
	createSignal<ActiveNodeDetails>({
		title: "",
		paragraphs: [],
	});

const defaultContext = {
	nodes: new ReactiveMap<string, NodeInfo>(),
	selectedNodes,
	setSelectedNodes,
	activeNodeDetails,
	setActiveNodeDetails,
	showActiveNodeDetails,
	setShowActiveNodeDetails,
};

export const ProgramMapContext =
	createContext<ProgramMapContextType>(defaultContext);

export function Provider(props: { children: JSXElement }) {
	return (
		<ProgramMapContext.Provider value={defaultContext}>
			{props.children}
		</ProgramMapContext.Provider>
	);
}
