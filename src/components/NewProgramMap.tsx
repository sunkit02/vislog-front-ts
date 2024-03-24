import { ReactiveMap } from "@solid-primitives/map";
import {
  For,
  JSXElement,
  Match,
  Show,
  Switch,
  createSignal,
  onMount,
} from "solid-js";
import { generateId } from "../utils/keygen";
import CurvedArrow from "./utility/CurvedArrow";
import * as T from "../types";

type NodeInfo = {
  id: string;
  parentId: string | null;
  element: JSXElement;
  childrenIds: string[];
  childrenEdges: JSXElement[];
};

function ProgramMap(props: { program: T.Program }) {
  const nodes = new ReactiveMap<string, NodeInfo>();

  let pmContainerRef: HTMLDivElement | undefined;

  onMount(() => {
    // Center the scroll bar for entire ProgramMap
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
  });

  return (
    <article
      ref={pmContainerRef}
      class={`relative h-[80vh] w-[90vw] overflow-scroll rounded-lg border-2 border-solid border-black bg-yellow-50 p-5`}
    >
      <Program program={props.program} />
    </article>
  );
}

function Program(props: { program: T.Program }) {
  console.log("Program", props.program);

  const id = generateId(props.program.title);

  const contents = (
    <div class="flex flex-col items-center justify-center">
      <h3 class="w-[80%] text-center">{props.program.title}</h3>
      <a
        href={props.program.url}
        target="_blank"
        class="underline hover:text-blue-600"
      >
        Link to Catalog
      </a>
    </div>
  );

  return (
    <Node id={id} nodeContent={contents}>
      <Switch fallback={<FallbackMessage target="Program" />}>
        <Match when={props.program.requirements}>
          {(reqs) => <Requirements reqs={reqs()} parentId={id} />}
        </Match>
        <Match when={props.program.requirements === null}>
          <div>No Requirements Listed</div>
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
  console.log("RequirementModule", props.reqModule);
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
  const id = generateId(props.req.data.title || "SingleBasicRequirement");
  const content = <h3 class="w-[80%] text-center">{props.req.data.title}</h3>;

  return (
    <Node id={id} parentId={props.parentId} nodeContent={content}>
      <Requirement req={props.req.data.requirement} parentId={id} />
    </Node>
  );
}

function BasicRequirements(props: {
  req: T.BasicRequirements;
  parentId: string;
}) {
  console.log("BasicRequirements", props.req);
  console.log("BasicRequirements title", props.req.data.title);
  const id = generateId(props.req.data.title || "SingleBasicRequirement");
  const content = <h3 class="w-[80%] text-center">{props.req.data.title}</h3>;

  return (
    <Node id={id} parentId={props.parentId} nodeContent={content}>
      <div class="flex flex-row items-start justify-center">
        <For each={props.req.data.requirements}>
          {(req) => <Requirement req={req} parentId={id} />}
        </For>
      </div>
    </Node>
  );
}

function ModuleLabel(props: { req: T.ModuleLabel; parentId: string }) {
  return (
    <Node
      id={generateId(props.req.data.title)}
      parentId={props.parentId}
      nodeContent={<h3 class="w-[80%] text-center">{props.req.data.title}</h3>}
    />
  );
}

function Unimplemented(props: { rawContent: unknown; parentId: string }) {
  const id = generateId("Unimplemented");
  return (
    <Node
      id={id}
      parentId={props.parentId}
      nodeContent={
        <div class="flex flex-col items-center justify-center p-5">
          <h3 class="w-[80%] text-center">Unimplemented</h3>
          <button
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
  console.log("Requirement", props.req);
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
  const id = generateId(props.data.title || "Courses");
  const content = (
    <h3 class="w-[80%] text-center">{props.data.title || "Courses"}</h3>
  );

  return (
    <Node id={id} nodeContent={content} parentId={props.parentId}>
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
  const id = generateId(props.data.title);

  return (
    <Node
      id={id}
      parentId={props.parentId}
      nodeContent={
        <div class="flex flex-col items-center justify-center gap-5">
          <h3 class="w-[80%] text-center">{props.data.title}</h3>
          <Show when={props.data.courses} fallback={<p>No courses listed.</p>}>
            {(entries) =>
              entries().map((entry) => (
                <CourseEntry entry={entry} parentId={id} />
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
  const id = generateId(props.data.title || "RequirementLabel");

  return (
    <Node
      id={id}
      parentId={props.parentId}
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
  isNested?: boolean;
  parentId: string;
}) {
  return (
    <Switch>
      <Match when={props.entry.type === T.CourseEntryType.And}>
        <And
          entries={(props.entry as T.And).data}
          isNested={props.isNested}
          parentId={props.parentId}
        />
      </Match>
      <Match when={props.entry.type === T.CourseEntryType.Or}>
        <Or entries={(props.entry as T.Or).data} parentId={props.parentId} />
      </Match>
      <Match when={props.entry.type === T.CourseEntryType.Course}>
        <Course
          course={(props.entry as T.EntryCourse).data}
          parentId={props.parentId}
        />
      </Match>
      <Match when={props.entry.type === T.CourseEntryType.Label}>
        <Label
          label={(props.entry as T.EntryLabel).data}
          parentId={props.parentId}
        />
      </Match>
    </Switch>
  );
}

function And(props: {
  entries: T.CourseEntry[];
  isNested?: boolean;
  parentId: string;
}) {
  const id = generateId("And");

  return (
    <Node
      id={id}
      parentId={props.parentId}
      nodeContent={
        <div class="flex flex-col items-center justify-center gap-5 p-5">
          <h3 class="w-[80%] text-center">And</h3>
          <div
            class={`flex ${props.entries.length <= 3 && props.isNested === false ? "flex-row" : "flex-col"} items-center justify-center gap-5`}
          >
            <For each={props.entries}>
              {(entry) => (
                <CourseEntry entry={entry} isNested={true} parentId={id} />
              )}
            </For>
          </div>
        </div>
      }
    ></Node>
  );
}

// TODO: Display different options as horizontal branches of the program map
function Or(props: { entries: T.CourseEntry[]; parentId: string }) {
  console.log("Or entry length: ", props.entries.length);

  return (
    <div class="flex flex-row gap-5">
      <For each={props.entries}>
        {(entry) => (
          <CourseEntry
            entry={entry}
            isNested={true}
            parentId={props.parentId}
          />
        )}
      </For>
    </div>
  );
}

function Label(props: { label: T.Label; parentId: string}) {
  return (
    <Node
      id={generateId(props.label.name)}
      parentId={props.parentId}
      nodeContent={
        <>
          <h3 class="w-[80%] text-center">{props.label.name}</h3>
        </>
      }
    />
  );
}

function Course(props: { course: T.Course; parentId: string }) {
  const id = generateId(props.course.name || "Course");
  return (
    <Node
      id={id}
      parentId={props.parentId}
      nodeContent={
        <div class="flex flex-col items-center justify-center">
          <h3 class="w-[80%] text-center">
            {props.course.name || `Course: ${props.course.guid}`}
          </h3>
          <a
            href={props.course.url}
            target="_blank"
            class="underline hover:text-blue-600"
          >
            Link to Course
          </a>
        </div>
      }
    />
  );
}

function Node(props: {
  id: string;
  nodeContent: JSXElement;
  parentId?: string;
  children?: JSXElement;
}) {
  const [arrow, setArrow] = createSignal<JSXElement | undefined>(undefined);

  let nodeRef: HTMLDivElement | undefined;
  let svgRef: SVGSVGElement | undefined;

  onMount(() => {
    if (!props.parentId) return;

    const parentNode = document.getElementById(props.parentId);
    const parentBoundingRect = parentNode?.getBoundingClientRect();
    const selfBoundingRect = nodeRef?.getBoundingClientRect();
    const svgBoundingRect = svgRef?.getBoundingClientRect();

    console.log("parentBoundingRect", parentBoundingRect);
    console.log("selfBoundingRect", selfBoundingRect);
    console.log("svgBoundingRect", svgBoundingRect);

    if (selfBoundingRect && parentBoundingRect && svgBoundingRect) {
      const { x, y, height, width } = selfBoundingRect;
      console.log({ x, y, height, width });

      const {
        x: parentX,
        y: parentY,
        height: parentHeight,
        width: parentWidth,
      } = parentBoundingRect;
      console.log({ parentX, parentY, parentHeight, parentWidth });

      const { x: offsetX, y: offsetY } = svgBoundingRect;
      console.log({ offsetX, offsetY });

      const startX = parentX + parentWidth / 2 - offsetX;
      const startY = parentY + parentHeight - offsetY;

      const endX = x + width / 2 - offsetX;
      const endY = y - offsetY;

      const arrow = (
        <CurvedArrow id="" x1={startX} y1={startY} x2={endX} y2={endY} />
      );

      console.log("Hello from onMount");
      console.log(props.parentId);

      setArrow(arrow);
    }
  });

  return (
    <div class="node-container flex w-max flex-shrink-0 flex-col gap-20 rounded border border-black p-10">
      <div class="section-container flex flex-row items-center justify-center">
        <section
          id={props.id}
          ref={nodeRef}
          class="flex min-h-[120px] min-w-[250px] items-center justify-center rounded-lg border-2 border-solid border-black bg-sky-100 transition hover:bg-sky-300"
        >
          {props.nodeContent}
        </section>
      </div>
      <svg class="absolute h-0 w-0 overflow-visible" ref={svgRef}>
        {arrow()}
      </svg>
      {props.children ? (
        <div class="children-container flex flex-shrink-0 flex-row items-start justify-center gap-20">
          {props.children}
        </div>
      ) : null}
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

export default ProgramMap;
