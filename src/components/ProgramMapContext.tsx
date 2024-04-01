import { ReactiveMap } from "@solid-primitives/map";
import {
	type JSXElement,
	createContext,
	type Accessor,
	type Setter,
	createSignal,
} from "solid-js";
import type { NodeInfo } from "./ProgramMap";
import type { ActiveNodeDetails } from "./programmap/ActiveNodeDetails";

export type NodeContextType = {
	nodes: ReactiveMap<string, NodeInfo>;
	activeNodeDetails: Accessor<ActiveNodeDetails>;
	setActiveNodeDetails: Setter<ActiveNodeDetails>;
	showActiveNodeDetails: Accessor<boolean>;
	setShowActiveNodeDetails: Setter<boolean>;
};

const [showActiveNodeDetails, setShowActiveNodeDetails] = createSignal(false);
const [activeNodeDetails, setActiveNodeDetails] =
	createSignal<ActiveNodeDetails>({
		title: "",
		paragraphs: [],
	});

const defaultContext = {
	nodes: new ReactiveMap<string, NodeInfo>(),
	activeNodeDetails,
	setActiveNodeDetails,
	showActiveNodeDetails,
	setShowActiveNodeDetails,
};

export const NodeContext = createContext<NodeContextType>(defaultContext);

export function Provider(props: { children: JSXElement }) {
	return (
		<NodeContext.Provider value={defaultContext}>
			{props.children}
		</NodeContext.Provider>
	);
}
