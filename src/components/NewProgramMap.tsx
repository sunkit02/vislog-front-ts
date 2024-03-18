import { ReactiveMap } from "@solid-primitives/map";
import { For, JSXElement, Match, Show, Switch } from "solid-js";
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
    <article class="h-[80vh] w-[90vw] overflow-scroll rounded-lg border-2 border-solid border-black bg-yellow-50 p-5">
      <Program program={props.program} />
    </article>
  );
}

function Program(props: { program: T.Program }) {
  console.log("Program", props.program);
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
  const content = <h3 class="w-[80%] text-center">{props.req.data.title}</h3>;

  return (
    <Node
      id={generateId(props.req.data.title || "SingleBasicRequirement")}
      nodeContent={content}
    >
      <Requirement req={props.req.data.requirement} />
    </Node>
  );
}

function BasicRequirements(props: { req: T.BasicRequirements }) {
  console.log("BasicRequirements", props.req);
  console.log("BasicRequirements title", props.req.data.title);
  const content = <h3 class="w-[80%] text-center">{props.req.data.title}</h3>;

  return (
    <Node
      id={generateId(props.req.data.title || "SingleBasicRequirement")}
      nodeContent={content}
    >
      <div class="flex flex-row items-start justify-center">
        <For each={props.req.data.requirements}>
          {(req) => <Requirement req={req} />}
        </For>
      </div>
    </Node>
  );
}

function ModuleLabel(props: { req: T.ModuleLabel }) {
  return (
    <Node
      id={generateId(props.req.data.title)}
      nodeContent={<h3 class="w-[80%] text-center">{props.req.data.title}</h3>}
    />
  );
}

function Unimplemented(props: { rawContent: unknown }) {
  const id = generateId("Unimplemented");
  return (
    <Node
      id={id}
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

function Requirement(props: { req: T.Requirement }) {
  console.log("Requirement", props.req);
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
  const content = (
    <h3 class="w-[80%] text-center">{props.data.title || "Courses"}</h3>
  );

  return (
    <Node id={generateId(props.data.title || "Courses")} nodeContent={content}>
      <div class="flex flex-col items-center justify-center gap-20">
        <For each={props.data.courses}>
          {(entry) => <CourseEntry entry={entry} />}
        </For>
      </div>
    </Node>
  );
}

function SelectFromCourses(props: {
  data: { title: string; courses: T.CourseEntry[] | null };
}) {
  return (
    <Node
      id={generateId(props.data.title)}
      nodeContent={
        <div class="flex flex-col items-center justify-center gap-5">
          <h3 class="w-[80%] text-center">{props.data.title}</h3>
          <Show when={props.data.courses} fallback={<p>No courses listed.</p>}>
            {(entries) =>
              entries().map((entry) => <CourseEntry entry={entry} />)
            }
          </Show>
        </div>
      }
    />
  );
}

function RequirementLabel(props: {
  data: { title: string | null; reqNarrative: string | null };
}) {
  return (
    <Node
      id={generateId(props.data.title || "RequirementLabel")}
      nodeContent={
        <>
          <h3 class="w-[80%] text-center">{props.data.title}</h3>
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
        <div class="flex flex-col items-center justify-center gap-5 p-5">
          <h3 class="w-[80%] text-center">And</h3>
          <div
            class={`flex ${props.entries.length <= 3 ? "flex-row" : "flex-col"} items-center justify-center gap-5`}
          >
            <For each={props.entries}>
              {(entry) => <CourseEntry entry={entry} />}
            </For>
          </div>
        </div>
      }
    ></Node>
  );
}

// TODO: Display different options as horizontal branches of the program map
function Or(props: { entries: T.CourseEntry[] }) {
  console.log("Or entry length: ", props.entries.length);

  return (
    <Node
      id={generateId("Or")}
      nodeContent={
        <div class="flex flex-col items-center justify-center gap-5 p-5">
          <h3 class="w-[80%] text-center">Or</h3>
          <div
            class={`flex ${props.entries.length <= 3 ? "flex-row" : "flex-col"} items-center justify-center gap-5`}
          >
            <For each={props.entries}>
              {(entry) => <CourseEntry entry={entry} />}
            </For>
          </div>
        </div>
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
          <h3 class="w-[80%] text-center">{props.label.name}</h3>
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
  children?: JSXElement;
}) {
  return (
    <div class="flex flex-shrink-0 flex-col items-center justify-center gap-20">
      <section
        id={props.id}
        class="flex min-h-[120px] min-w-[250px] items-center justify-center rounded-lg border-2 border-solid border-black bg-sky-100 hover:bg-sky-300"
      >
        {props.nodeContent}
      </section>
      {props.children ? (
        <div class="flex flex-shrink-0 flex-row items-center justify-center gap-20">
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
