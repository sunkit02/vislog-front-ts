import {
  Match,
  Suspense,
  Switch,
  createResource,
  createSignal,
} from "solid-js";

const fetchProgram2 = async (programName: string) => {
  const response = await fetch(`http://localhost:3001/${programName}.json`);
  return response.json();
};

function App() {
  const [programName, setProgramName] = createSignal(
    "major_in_computer_science"
  );
  const [programJson] = createResource(programName, fetchProgram2);

  return (
    <div>
      <input
        inputmode="text"
        placeholder="Program Name"
        value={programName().replaceAll("_", " ")}
        onChange={(e) => {
          const processedProgramName = e.target.value.replaceAll(" ", "_");
          console.log(processedProgramName);
          setProgramName(processedProgramName);
        }}
      />
      <Suspense fallback={<p>Loading...</p>}>
        <Switch>
          <Match when={programJson.error}>
            <span>
              Error: {`Program with name: ${programName()} is not found.`}
            </span>
          </Match>
          <Match when={programJson()}>
            <textarea class="text-sky-800 h-[90vh] w-full resize-none overflow-scroll">
              {JSON.stringify(programJson(), null, 4)}
            </textarea>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
}

export default App;
