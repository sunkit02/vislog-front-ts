import { ReactiveMap } from "@solid-primitives/map";
import { For, JSXElement, Match, Switch } from "solid-js";
import { generateId } from "../utils/keygen";
import * as T from "../types";

type NodeInfo = {
  id: string;
  parentId: string | null;
  element: JSXElement;
  childrenIds: string[];
  childrenEdges: JSXElement[];
};

function NewProgramMap(props: { program: T.Program }) {
  const nodes = new ReactiveMap<string, NodeInfo>();

  return (
    <article class="h-[80vh] w-[90vw] rounded-lg border-2 border-solid border-black bg-yellow-50 p-5">
      <Program program={props.program} />
    </article>
  );
}

function Program(props: { program: T.Program }) {
  console.log("Program", props.program);
  const contents = (
    <>
      <h3 class="text-center">{props.program.title}</h3>
    </>
  );

  return (
    <div class="flex h-full w-full flex-col items-center justify-start">
      <Node id={generateId(props.program.title)} nodeContent={contents}>
        <Switch fallback={<FallbackMessage target="Program" />}>
          <Match when={props.program.requirements}>
            {(reqs) => <Requirements reqs={reqs()} />}
          </Match>
          <Match when={props.program.requirements === null}>
            <div>No Requirements Listed</div>
          </Match>
        </Switch>
      </Node>
    </div>
  );
}

function Requirements(props: { reqs: T.Requirements }) {
  console.log("Requirements", props.reqs);
  return (
    <Switch>
      <Match when={props.reqs.type === T.RequirementsType.Single}>
        <RequirementModule
          reqModule={(props.reqs as T.SingleRequirement).data}
        />
      </Match>
      <Match when={props.reqs.type === T.RequirementsType.Many}>
        <For each={(props.reqs as T.ManyRequirements).data}>
          {(reqModule) => <RequirementModule reqModule={reqModule} />}
        </For>
      </Match>
    </Switch>
  );
}

function RequirementModule(props: { reqModule: T.RequirementModule }) {
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
        />
      </Match>
      <Match
        when={
          props.reqModule.type === T.RequirementModuleType.BasicRequirements
        }
      >
        <BasicRequirements req={props.reqModule as T.BasicRequirements} />
      </Match>
      <Match
        when={
          props.reqModule.type === T.RequirementModuleType.SelectOneEmphasis
        }
      >
        <Unimplemented rawContent={props.reqModule} />
      </Match>
      <Match when={props.reqModule.type === T.RequirementModuleType.Label}>
        <ModuleLabel req={props.reqModule as T.ModuleLabel} />
      </Match>
      <Match
        when={props.reqModule.type === T.RequirementModuleType.Unimplemented}
      >
        <Unimplemented rawContent={props.reqModule} />
      </Match>
    </Switch>
  );
}

function SingleBasicRequirement(props: { req: T.SingleBasicRequirement }) {
  const content = <h3>{props.req.title}</h3>;

  return (
    <Node
      id={generateId(props.req.title || "SingleBasicRequirement")}
      nodeContent={content}
    >
      <Requirement req={props.req.requirement} />
    </Node>
  );
}

function BasicRequirements(props: { req: T.BasicRequirements }) {
  const content = <h3>{props.req.title}</h3>;

  return (
    <Node
      id={generateId(props.req.title || "SingleBasicRequirement")}
      nodeContent={content}
    >
      <For each={props.req.requirements}>
        {(req) => <Requirement req={req} />}
      </For>
    </Node>
  );
}

function ModuleLabel(props: { req: T.ModuleLabel }) {
  return (
    <Node
      id={generateId(props.req.data.title)}
      nodeContent={<h3>{props.req.data.title}</h3>}
    />
  );
}

function Unimplemented(props: { rawContent: unknown }) {
  const id = generateId("Unimplemented");
  return (
    <Node
      id={id}
      nodeContent={
        <>
          <h3>Unimplemented</h3>
          <button
            onClick={() => {
              console.log(`RawContent for Node with id: ${id}`);
              console.log(JSON.stringify(props.rawContent, null, 4));
            }}
          >
            Console Log Raw Content
          </button>
        </>
      }
    />
  );
}

function Requirement(props: { req: T.Requirement }) {
  return (
    <Switch>
      <Match when={props.req.type === T.RequirementType.Courses}>
        <Courses data={(props.req as T.Courses).data} />
      </Match>
      <Match when={props.req.type === T.RequirementType.SelectFromCourses}>
        <SelectFromCourses data={(props.req as T.SelectFromCourses).data} />
      </Match>
      <Match when={props.req.type === T.RequirementType.Label}>
        <RequirementLabel data={(props.req as T.RequirementLabel).data} />
      </Match>
    </Switch>
  );
}

function Courses(props: {
  data: { title: string | null; courses: T.CourseEntry[] };
}) {
  const content = <h3>{props.data.title || "Courses"}</h3>;

  return (
    <Node id={generateId(props.data.title || "Courses")} nodeContent={content}>
      <For each={props.data.courses}>
        {(entry) => <CourseEntry entry={entry} />}
      </For>
    </Node>
  );
}

function SelectFromCourses(props: {
  data: { title: string; courses: T.CourseEntry[] | null };
}) {
  return <Unimplemented rawContent={props.data} />;
}

function RequirementLabel(props: {
  data: { title: string | null; reqNarrative: string | null };
}) {
  return (
    <Node
      id={generateId(props.data.title || "RequirementLabel")}
      nodeContent={
        <>
          <h3>{props.data.title}</h3>
          <p>{props.data.reqNarrative}</p>
        </>
      }
    />
  );
}

function CourseEntry(props: { entry: T.CourseEntry }) {
  return (
    <Switch>
      <Match when={props.entry.type === T.CourseEntryType.And}>
        <And entries={(props.entry as T.And).data} />
      </Match>
      <Match when={props.entry.type === T.CourseEntryType.Or}>
        <Or entries={(props.entry as T.Or).data} />
      </Match>
      <Match when={props.entry.type === T.CourseEntryType.Course}>
        <Course course={(props.entry as T.EntryCourse).data} />
      </Match>
      <Match when={props.entry.type === T.CourseEntryType.Label}>
        <Label label={(props.entry as T.EntryLabel).data} />
      </Match>
    </Switch>
  );
}

function And(props: { entries: T.CourseEntry[] }) {
  return (
    <Node
      id={generateId("And")}
      nodeContent={
        <>
          <h3>And</h3>
          <For each={props.entries}>
            {(entry) => <CourseEntry entry={entry} />}
          </For>
        </>
      }
    ></Node>
  );
}
function Or(props: { entries: T.CourseEntry[] }) {
  return (
    <Node
      id={generateId("Or")}
      nodeContent={
        <>
          <h3>And</h3>
          <For each={props.entries}>
            {(entry) => <CourseEntry entry={entry} />}
          </For>
        </>
      }
    ></Node>
  );
}
function Label(props: { label: T.Label }) {
  return (
    <Node
      id={generateId(props.label.name)}
      nodeContent={
        <>
          <h3>{props.label.name}</h3>
        </>
      }
    />
  );
}
function Course(props: { course: T.Course }) {
  return (
    <Node
      id={generateId(props.course.name || "Course")}
      nodeContent={
        <>
          <h3>{props.course.name || `Course: ${props.course.guid}`}</h3>
          <a href={props.course.url}>Link to Course</a>
        </>
      }
    />
  );
}

function Node(props: {
  id: string;
  nodeContent: JSXElement;
  children?: JSXElement;
}) {
  return (
    <div class="flex flex-shrink-0 flex-col items-center justify-center">
      <section
        id={props.id}
        class="flex h-[120px] w-[250px] items-center justify-center rounded-lg border-2 border-solid border-black bg-sky-100 hover:cursor-pointer hover:bg-sky-300"
      >
        {props.nodeContent}
      </section>
      {props.children ? (
        <div class="flex flex-shrink-0 flex-row items-center justify-center">
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

export default NewProgramMap;
