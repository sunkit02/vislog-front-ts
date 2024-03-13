type Program = {
  url: string;
  guid: string;
  title: string;
  requirements: Requirements | null;
};

type Requirements = SingleRequirement | ManyRequirements;

type SingleRequirement = {
  type: RequirementsType.Single;
  data: RequirementModule;
};

type ManyRequirements = {
  type: RequirementsType.Many;
  data: RequirementModule[];
};

const enum RequirementsType {
  Single = "Single",
  Many = "Many",
}

type RequirementModule =
  | SingleBasicRequirement
  | BasicRequirements
  | SelectOneEmphasis
  | ModuleLabel
  | Unimplemented;

const enum RequirementModuleType {
  SingleBasicRequirement = "SingleBasicRequirement",
  BasicRequirements = "BasicRequirements",
  SelectOneEmphasis = "SelectOneEmphasis",
  Label = "Label",
  Unimplemented = "Unimplemented",
}

type SingleBasicRequirement = {
  type: RequirementModuleType.SingleBasicRequirement;
  title: string | null;
  requirement: Requirement;
};

type BasicRequirements = {
  type: RequirementModuleType.BasicRequirements;
  title: string | null;
  requirements: Requirement[];
};

type SelectOneEmphasis = {
  type: RequirementModuleType.SelectOneEmphasis;
  data: Requirement[];
};

/**
 * Corresponding to rust enum `vislog::RequirementModule::Label`
 */
type ModuleLabel = {
  type: RequirementModuleType.Label;
  data: {
    title: string;
  };
};

type Unimplemented = {
  type: RequirementModuleType.Unimplemented;
  data: unknown;
};

type Requirement = Courses | SelectFromCourses | RequirementLabel;

const enum RequirementType {
  Courses = "Courses",
  SelectFromCourses = "SelectFromCourses",
  Label = "Label",
}

type Courses = {
  type: RequirementType.Courses;
  data: {
    title: string | null;
    courses: CourseEntry[];
  };
};

type SelectFromCourses = {
  type: RequirementType.SelectFromCourses;
  data: {
    title: string;
    courses: CourseEntry[] | null;
  };
};

/**
 * Corresponding to rust enum `vislog::Requirement::Label`
 */
type RequirementLabel = {
  type: RequirementType.Label;
  data: {
    title: string | null;
    req_narrative: string | null;
  };
};

type CourseEntry = And | Or | EntryLabel | EntryCourse;

const enum CourseEntryType {
  And = "And",
  Or = "Or",
  EntryLabel = "EntryLabel",
  Course = "Course",
}

type And = {
  type: CourseEntryType.And;
  data: CourseEntry[];
};

type Or = {
  type: CourseEntryType.Or;
  data: CourseEntry[];
};

type EntryLabel = {
  type: CourseEntryType.EntryLabel;
  data: Label;
};

type EntryCourse = {
  type: CourseEntryType.Course;
  data: Course;
};

type Label = {
  url: string;
  guid: string;
  name: string;
  number: string | null;
  subject_code: string | null;
  credits: [number, number | null];
};
type Course = {
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
