import {
	Match,
	Switch,
	createEffect,
	createResource,
	createSignal,
} from "solid-js";
import SearchBar from "./components/utility/SearchBar";
import ProgramMap from "./components/NewProgramMap";
import type { Program } from "./types";

const fetchProgramNames = async (): Promise<string[]> => {
	const url = "http://10.253.132.175:3001/program_names.json";
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
	const [programName, setProgramName] = createSignal("Minor in Music");
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
				"An error occured when loading program names. See console for more information.",
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
						<ProgramMap program={programJson() as Program} />
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

export default App;
