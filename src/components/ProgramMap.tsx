// 1. keep track of the nodes
// 2. keep track of the edges
// 3. edges to be updated quickly when dragged (reference by a hash map?)
// 4. rendering in order (course->arrow->children->children arrows)?
//
// NOTE: Create a layer between commands directly interacting with the DOM and the issuer of the command to future-proof for screen sharing

import { ReactiveMap } from "@solid-primitives/map";
import { generateId } from "../utils/keygen";
import { For, JSXElement, createEffect, createSignal } from "solid-js";

type NodeInfo = {
  parentId: string | null;
  childrenIds: string[];
};


function ProgramMap(props: { program: any }) {
  let nodes = new ReactiveMap<string, NodeInfo>();
  console.log("Immediately: ", Array.from(nodes));

  return (
    <>
      <h2 style={{ "text-align": "center" }}>{props.program.title}</h2>
      <ProgramMapContainer
        style={{
          height: "80vh",
        }}
      >
        <Program
          title={props.program.title}
          requirements={props.program.requirements}
          nodes={nodes}
        />
      </ProgramMapContainer>
    </>
  );
}

function ProgramMapContainer(props: {
  style: { [key: string]: string };
  children: JSXElement;
}) {
  return (
    <article
      style={{
        padding: "5rem",
        margin: "2rem",
        display: "flex",
        "flex-direction": "row",
        "justify-content": "flex-start",
        "align-items": "flex-start",

        "background-color": "beige",
        border: "solid 2px black",
        "border-radius": "0.5rem",

        overflow: "scroll",
        ...props.style,
      }}
    >
      {props.children}
    </article>
  );
}

function SVGOverlay(props: { children: JSXElement }) {
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        height: "100%",
        width: "100%",
        "pointer-events": "none",
      }}
    >
      {props.children}
    </svg>
  );
}

function Program(props: {
  nodes: ReactiveMap<string, NodeInfo>;
  title: string;
  requirements: any;
}) {
  let [arrows, setArrows] = createSignal<JSXElement[]>([]);
  let id = generateId(props.title);

  createEffect(() => {
    const svgOverlay = document.querySelector("svg");
    if (svgOverlay) {
      const { x: overlayOffsetX, y: overlayOffsetY } =
        svgOverlay.getBoundingClientRect();

      let newArrows = Array.from(props.nodes)
        .map(([id, nodeEntry]) => {
          console.log(`id: ${id}`);
          const node = document.getElementById(id);
          if (node) {
            const { x, y, height, width } = node.getBoundingClientRect();

            const startX = x + width - overlayOffsetX;
            const startY = y + height / 2 - overlayOffsetY;

            return nodeEntry.childrenIds.map((childId) => {
              const childNode = document.getElementById(childId);

              if (childNode) {
                const childX = childNode.getBoundingClientRect().x;
                const childY = childNode.getBoundingClientRect().y;
                const childHeight = childNode.getBoundingClientRect().height;

                const endX = childX - overlayOffsetX;
                const endY = childY + childHeight / 2 - overlayOffsetY;

                return (
                  <SmoothCurveArrow
                    id={`${id}->${childId}`}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                  />
                );
              }
              return null;
            });
          } else {
            return null;
          }
        })
        .flat()
        .filter((e) => e);

      setArrows(newArrows);
    }
  });

  // NOTE: This must be placed before the children nodes are generated to ensure that this entry exists when accessed by children
  props.nodes.set(id, {
    parentId: null,
    childrenIds: [],
  });

  const childrenNodes = (
    <For each={props.requirements}>
      {(req) => (
        <Requirement
          title={req.title}
          entries={req.courses}
          nodes={props.nodes}
          parentId={id}
        />
      )}
    </For>
  );

  return (
    <NodeContainer childrenNodes={childrenNodes}>
      <Node id={id} nodes={props.nodes}>
        <h3>{props.title}</h3>
      </Node>
      <SVGOverlay>{arrows()}</SVGOverlay>
    </NodeContainer>
  );
}

function NodeContainer(props: {
  children: JSXElement;
  childrenNodes: JSXElement;
}) {
  const [childrenHidden, setChildrenHidden] = createSignal(false);

  return (
    <div
      id="node-container"
      style={{
        position: "relative",
        display: "flex",
        "flex-direction": "row",
        "justify-content": "center",
        "align-items": "center",
        "flex-shrink": 0,
      }}
    >
      {props.children}
      <button onclick={() => setChildrenHidden(!childrenHidden())}>
        Children
      </button>
      <div hidden={childrenHidden()}>
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            "justify-content": "flex-start",
            "align-items": "center",
          }}
        >
          {props.childrenNodes}
        </div>
      </div>
    </div>
  );
}

function Node(props: {
  id: string;
  margin?: string;
  nodes: ReactiveMap<string, NodeInfo>;
  children: JSXElement;
}) {
  let nodeRef;

  function highlightNode(targetNode: HTMLElement) {
    targetNode.classList.remove("normal-node");
    targetNode.classList.add("hover-node");
  }

  function unHighlightNode(targetNode: HTMLElement) {
    targetNode.classList.add("normal-node");
    targetNode.classList.remove("hover-node");
  }

  function handleMouseEnterNode() {
    console.log(`Mouse entered ${props.id}`);

    // Highlight current node and all its parents
    let currNodeId: string | undefined | null = props.id;
    while (currNodeId) {
      console.log(currNodeId);
      const currNode = document.getElementById(currNodeId);
      if (currNode) {
        highlightNode(currNode);

        const parentId: string | null | undefined =
          props.nodes.get(currNodeId)?.parentId;
        if (parentId) {
          const arrowId = `${parentId}->${currNodeId}`;
          const arrow = document.getElementById(arrowId);
          arrow?.setAttribute("stroke", "lightblue");
        }

        currNodeId = parentId;
      } else {
        currNodeId = null;
      }
    }
  }

  function handleMouseLeaveNode() {
    console.log(`Mouse left ${props.id}`);

    // Highlight current node and all its parents
    let currNodeId: string | null | undefined = props.id;
    while (currNodeId) {
      console.log(currNodeId);
      const currNode = document.getElementById(currNodeId);
      if (currNode) {
        unHighlightNode(currNode);

        const parentId: string | null | undefined =
          props.nodes.get(currNodeId)?.parentId;
        if (parentId) {
          const arrowId = `${parentId}->${currNodeId}`;
          const arrow = document.getElementById(arrowId);
          arrow?.setAttribute("stroke", "black");
        }

        currNodeId = parentId;
      } else {
        currNodeId = null;
      }
    }
  }

  return (
    <div
      id={props.id}
      ref={nodeRef}
      class={"normal-node"}
      style={{
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        border: "solid 2px blue",
        "border-radius": "0.5rem",
        width: "250px",
        height: "120px",
        margin: props.margin ? props.margin : "10px 200px 10px 0px",
        "flex-shrink": 0,
        transition: "0.25s",
      }}
      onMouseEnter={handleMouseEnterNode}
      onMouseLeave={handleMouseLeaveNode}
    >
      {props.children}
    </div>
  );
}

function Requirement(props: {
  parentId: string;
  title: string;
  nodes: ReactiveMap<string, NodeInfo>;
  entries: any[];
}) {
  const id = generateId(props.title);

  // Add current Node as an entry to nodes map
  props.nodes.set(id, {
    parentId: props.parentId,
    childrenIds: [],
  });

  // Add current Node's id to parent Node's children list
  const parentId = props.parentId;
  const parentEntry = props.nodes.get(parentId);
  if (parentEntry) {
    const newChildrenIds = [...parentEntry.childrenIds, id];
    props.nodes.set(parentId, { ...parentEntry, childrenIds: newChildrenIds });
  }

  let childrenNodes = (
    <For each={props.entries}>
      {(entry) => (
        <CourseEntry title={entry.title} nodes={props.nodes} parentId={id} />
      )}
    </For>
  );

  return (
    <NodeContainer childrenNodes={childrenNodes}>
      <Node id={id} nodes={props.nodes}>
        <h3>{props.title}</h3>
      </Node>
    </NodeContainer>
  );
}

function CourseEntry(props: {
  parentId: string;
  title: string;
  nodes: ReactiveMap<string, NodeInfo>;
}) {
  const id = generateId(props.title);

  // Add current Node as an entry to nodes map
  props.nodes.set(id, {
    parentId: props.parentId,
    childrenIds: [],
  });

  console.log(Array.from(props.nodes));

  // Add current Node's id to parent Node's children list
  const parentId = props.parentId;
  const parentEntry = props.nodes.get(parentId);
  if (parentEntry) {
    const newChildrenIds = [...parentEntry.childrenIds, id];
    props.nodes.set(parentId, { ...parentEntry, childrenIds: newChildrenIds });
  }

  return (
    <Node id={id} nodes={props.nodes}>
      <h4>{props.title}</h4>
    </Node>
  );
}

function SmoothCurveArrow(props: {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth?: number;
  showCurveLines?: boolean;
}) {
  const mid = {
    x: (props.x1 + props.x2) / 2,
    y: (props.y1 + props.y2) / 2,
  };

  const controlPoint1 = {
    x: (mid.x + props.x1) / 2,
    y: props.y1,
  };

  const controlPoint2 = {
    x: (mid.x + props.x2) / 2,
    y: props.y2,
  };

  const directives = `M ${props.x1} ${props.y1} Q ${controlPoint1.x} ${controlPoint1.y}, ${mid.x} ${mid.y} T ${props.x2} ${props.y2}`;

  const curveDemoLines = (
    <>
      <line
        x1={props.x1}
        y1={props.y1}
        x2={controlPoint1.x}
        y2={controlPoint1.y}
        stroke="blue"
        stroke-dasharray="5,5"
      />
      <circle cx={controlPoint1.x} cy={controlPoint1.y} r="2" fill="blue" />
      <line
        x1={controlPoint1.x}
        y1={controlPoint1.y}
        x2={mid.x}
        y2={mid.y}
        stroke="blue"
        stroke-dasharray="5,5"
      />
      <line
        x1={mid.x}
        y1={mid.y}
        x2={controlPoint2.x}
        y2={controlPoint2.y}
        stroke="blue"
        stroke-dasharray="5,5"
      />
      <circle cx={controlPoint2.x} cy={controlPoint2.y} r="2" fill="blue" />
      <line
        x1={controlPoint2.x}
        y1={controlPoint2.y}
        x2={props.x2}
        y2={props.y2}
        stroke="blue"
        stroke-dasharray="5,5"
      />
    </>
  );

  return (
    <>
      {props.showCurveLines === true ? curveDemoLines : null}
      <path
        id={props.id}
        style={{
          transition: "0.25s",
        }}
        class="normal-arrow"
        d={directives}
        fill="none"
        stroke="black"
        stroke-width={props.strokeWidth || 3}
      />
      ;
    </>
  );
}

export default ProgramMap;
