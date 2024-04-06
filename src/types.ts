export type Program = {
	url: string;
	guid: string;
	title: string;
	requirements: Requirements | null;
};

export type Requirements = SingleRequirement | ManyRequirements;

export type SingleRequirement = {
	type: RequirementsType.Single;
	data: RequirementModule;
};

export type ManyRequirements = {
	type: RequirementsType.Many;
	data: RequirementModule[];
};

export enum RequirementsType {
	Single = "Single",
	Many = "Many",
}

export type RequirementModule =
	| SingleBasicRequirement
	| BasicRequirements
	| SelectOneEmphasis
	| ModuleLabel
	| Unimplemented;

export enum RequirementModuleType {
	SingleBasicRequirement = "SingleBasicRequirement",
	BasicRequirements = "BasicRequirements",
	SelectOneEmphasis = "SelectOneEmphasis",
	Label = "Label",
	Unimplemented = "Unimplemented",
}

export type SingleBasicRequirement = {
	type: RequirementModuleType.SingleBasicRequirement;
	data: {
		title: string | null;
		requirement: Requirement;
	};
};

export type BasicRequirements = {
	type: RequirementModuleType.BasicRequirements;
	data: {
		title: string | null;
		requirements: Requirement[];
	};
};

export type SelectOneEmphasis = {
	type: RequirementModuleType.SelectOneEmphasis;
	data: Requirement[];
};

/**
 * Corresponding to rust enum `vislog::RequirementModule::Label`
 */
export type ModuleLabel = {
	type: RequirementModuleType.Label;
	data: {
		title: string;
	};
};

export type Unimplemented = {
	type: RequirementModuleType.Unimplemented;
	data: unknown;
};

export type Requirement = Courses | SelectFromCourses | RequirementLabel;

export enum RequirementType {
	Courses = "Courses",
	SelectFromCourses = "SelectFromCourses",
	Label = "Label",
}

export type Courses = {
	type: RequirementType.Courses;
	data: {
		title: string | null;
		courses: CourseEntry[];
	};
};

export type SelectFromCourses = {
	type: RequirementType.SelectFromCourses;
	data: {
		title: string;
		courses: CourseEntry[] | null;
	};
};

/**
 * Corresponding to rust enum `vislog::Requirement::Label`
 */
export type RequirementLabel = {
	type: RequirementType.Label;
	data: {
		title: string | null;
		reqNarrative: string | null;
	};
};

export type CourseEntry = And | Or | EntryLabel | EntryCourse;

export enum CourseEntryType {
	And = "And",
	Or = "Or",
	Label = "Label",
	Course = "Course",
}

export type And = {
	type: CourseEntryType.And;
	data: CourseEntry[];
};

export type Or = {
	type: CourseEntryType.Or;
	data: CourseEntry[];
};

export type EntryLabel = {
	type: CourseEntryType.Label;
	data: Label;
};

export type EntryCourse = {
	type: CourseEntryType.Course;
	data: Course;
};

export type Label = {
	url: string;
	guid: string;
	name: string;
	number: string | null;
	subject_code: string | null;
	credits: [number, number | null];
};
export type Course = {
	url: string;
	path: string;
	guid: string;
	name: string | null;
	number: string;
	subject_name: string | null;
	subject_code: string;

	/** The representation of possible credits earned by completing the course. The lower bound is
	 * the minimum that you can earn while the upper bound is the max. If there is a max, then the
	 * tuple should be interpreted as an inclusive range from the lower bound to the upper bound,
	 * which can be think of as (lower bound..=upper bound).
	 */
	credits: [number, number | null];
};

export type CourseDetails = {
	url: string;
	guid: string;
	path: string;
	subject_code: string;
	subject_name: string | null;
	number: string;
	name: string;
	credits_min: number;
	credits_max: number | null;
	description: string;
	prerequisite_narrative: string | null;
	prerequisite: string | null;
	corequisite_narrative: string | null;
	corequisite: string | null;
};
