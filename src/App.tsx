import {
	Match,
	Switch,
	createEffect,
	createResource,
	createSignal,
} from "solid-js";
import SearchBar from "./components/utility/SearchBar";
import ProgramMap from "./components/ProgramMap";
import type { Program } from "./types";

export const DATA_SERVER_URL = "http://10.253.132.175:8080";

type GuidTitlePair = {
	guid: string;
	title: string;
};

const fetchProgramNames = async (): Promise<Map<string, string>> => {
	const url = `${DATA_SERVER_URL}/api/programs/titles?with_guid=true`;
	console.log(`Fetching from: ${url}`);

	const titleMap = await fetch(url)
		.then((res) => res.json())
		.then((pairs: GuidTitlePair[]) => {
			return new Map(pairs.map((p) => [p.title, p.guid]));
		});
	return titleMap;
};

const fetchProgram = async (guid: string): Promise<Program> => {
	const url = `${DATA_SERVER_URL}/api/programs/${guid}`;
	console.log(`Fetching from: ${url}`);

	const response = await fetch(url);
	return response.json();
};

function App() {
	const [programName, setProgramName] = createSignal(
		"Major in Computer Science—42 hours",
	);

	const [programTitleMap, setProgramTitleMap] = createSignal<
		Map<string, string>
	>(new Map());
	const programTitles = () => Array.from(programTitleMap().keys());

	// FIX: Do not fetch resource when `programName` is an empty string
	const [programNamesResource] = createResource(fetchProgramNames);

	const programGuidByName = () => {
		const guid = programTitleMap().get(programName());
		console.log("got guid: ", guid);
		return guid;
	};
	const [programJson] = createResource(programGuidByName, fetchProgram);

	// Assign programNames once programNamesResource has loaded
	createEffect(() => {
		if (programNamesResource.state === "ready") {
			setProgramTitleMap(programNamesResource());
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
			<div class="flex w-[80%] md:w-[60%] lg:w-[40%] justify-center p-5 ">
				<SearchBar
					setSearchText={setProgramName}
					possibleSearches={programTitles}
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
