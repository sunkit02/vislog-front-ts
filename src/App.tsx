import {
  Match,
  Suspense,
  Switch,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";
import SearchBar from "./components/utility/SearchBar";

const fetchProgramNames = async (): Promise<string[]> => {
  const url = `http://localhost:3001/program_names.json`;
  console.log(`Fetching from: ${url}`);

  const response = await fetch(url);
  return response.json();
};

const fetchProgram = async (programName: string): Promise<Program> => {
  const processedProgramName = programName.toLowerCase().replaceAll(" ", "_");
  const url = `http://localhost:3001/${processedProgramName}.json`;
  console.log(`Fetching from: ${url}`);

  const response = await fetch(url);
  return response.json();
};

function App() {
  const [programName, setProgramName] = createSignal("");
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

  return (
    <div>
      <div class="flex justify-center">
      <SearchBar
        setSearchText={setProgramName}
        possibleSearches={programNames}
      />
      </div>
      {programName().length > 0 ? (
        <Suspense fallback={<p>Loading...</p>}>
          <Switch>
            <Match when={programJson.error}>
              <span>
                Error: {`Program with name: ${programName()} is not found.`}
              </span>
            </Match>
            <Match when={programJson()}>
              <textarea class="h-[90vh] w-full resize-none overflow-scroll text-sky-800">
                {JSON.stringify(programJson(), null, 4)}
              </textarea>
            </Match>
          </Switch>
        </Suspense>
      ) : null}
    </div>
  );
}

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

export default App;
