import {
  Match,
  Switch,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";
import SearchBar from "./components/utility/SearchBar";
import NewProgramMap from "./components/NewProgramMap";
import { Program } from "./types";

const fetchProgramNames = async (): Promise<string[]> => {
  const url = `http://10.253.132.175:3001/program_names.json`;
  console.log(`Fetching from: ${url}`);

  const response = await fetch(url);
  return response.json();
};

const fetchProgram = async (programName: string): Promise<Program> => {
  const processedProgramName = programName.toLowerCase().replaceAll(" ", "_");
  const url = `http://10.253.132.175:3001/${processedProgramName}.json`;
  console.log(`Fetching from: ${url}`);

  const response = await fetch(url);
  return response.json();
};

function App() {
  const [programName, setProgramName] = createSignal(
    "Major in Computer Science"
  );
  // FIX: Do not fetch resource when `programName` is an empty string
  const [programJson] = createResource(programName, fetchProgram);
  const [programNamesResource] = createResource(fetchProgramNames);
  const [programNames, setProgramNames] = createSignal<string[]>([]);

  // Assign programNames once programNamesResource has loaded
  createEffect(() => {
    if (programNamesResource.state === "ready") {
      setProgramNames(programNamesResource());
    } else if (programNamesResource.state === "errored") {
      alert(
        "An error occured when loading program names. See console for more information."
      );
      console.log(programNamesResource.error);
    }
  });

  createEffect(() => console.log(`JSON for ${programName()}`, programJson()));

  return (
    <div class="flex flex-col items-center justify-center">
      <div class="flex w-[30%] justify-center p-5">
        <SearchBar
          setSearchText={setProgramName}
          possibleSearches={programNames}
        />
      </div>
      <div class="mt-5 flex items-center justify-center">
        <Switch>
          <Match when={programJson.state === "ready"}>
            <NewProgramMap program={programJson() as Program} />
          </Match>
          <Match when={programJson.state === "pending"}>
            <div>Loading... </div>
          </Match>
          <Match when={programJson.state === "errored"}>
            <div>Failed to load "{programName()}"</div>
          </Match>
        </Switch>
      </div>
    </div>
  );
}

// const oldProgramMap = (
//   <Show when={programName().length > 0}>
//     <Suspense fallback={<p>Loading...</p>}>
//       <Switch>
//         <Match when={programJson.error}>
//           <span>
//             Error: {`Program with name: ${programName()} is not found.`}
//           </span>
//         </Match>
//         <Match when={programJson()}>
//           <textarea class="h-[90vh] w-full resize-none overflow-scroll text-sky-800">
//             {JSON.stringify(programJson(), null, 4)}
//           </textarea>
//         </Match>
//       </Switch>
//     </Suspense>
//   </Show>
// );

// const oldSearchBar = (
//       <input
//         inputmode="text"
//         placeholder="Program Name"
//         value={programName().replaceAll("_", " ")}
//         onInput={(e) => {
//           const processedProgramName = e.target.value.replaceAll(" ", "_");
//           console.log(processedProgramName);
//           setProgramName(processedProgramName);
//         }}
//       />
// );
const CS_MAJOR = {
  title: "CS Major",
  requirements: [
    {
      title: "Prerequisites",
      courses: [
        {
          title: "Calculus I",
        },
        {
          title: "Calculus II",
        },
        {
          title: "Discrete Math",
        },
      ],
    },
    {
      title: "Major Requirements",
      courses: [
        {
          title: "Intro to Computer Science",
        },
        {
          title: "Programming in Java",
        },
        {
          title: "Database Management Systems",
        },
        {
          title: "Computer Architecture",
        },
        {
          title: "Operating Systems",
        },
        {
          title: "Senior Seminar I",
        },
        {
          title: "Senior Seminar II",
        },
      ],
    },
  ],
};

export default App;
