import { ReactiveMap } from "@solid-primitives/map";
import { type JSXElement, createContext } from "solid-js";
import type { NodeInfo } from "./ProgramMap";

export type NodeContextType = {
	nodes: ReactiveMap<string, NodeInfo>;
};

export const NodeContext = createContext<NodeContextType>({
	nodes: new ReactiveMap<string, NodeInfo>(),
});

export function Provider(props: { children: JSXElement }) {
	return (
		<NodeContext.Provider
			value={{
				nodes: new ReactiveMap<string, NodeInfo>(),
			}}
		>
			{props.children}
		</NodeContext.Provider>
	);
}
