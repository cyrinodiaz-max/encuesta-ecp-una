export type RelationKey = "estudiante" | "docente" | "funcionario" | "egresado";

export type QuestionType =
  | "text"
  | "email"
  | "number"
  | "single"
  | "multiple"
  | "scale"
  | "textarea";

export type QuestionOption = {
  label: string;
  value: string;
};

export type Question = {
  id: string;
  prompt: string;
  helpText?: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  maxSelections?: number;
  scaleLabels?: [string, string, string, string, string];
  placeholder?: string;
};

export type Module = {
  id: string;
  title: string;
  subtitle: string;
  questions: Question[];
};

export type RelationConfig = {
  label: string;
  intro: string;
  modules: Module[];
};

export type QuestionnaireConfig = {
  projectTitle: string;
  projectSubtitle: string;
  publicDescription: string;
  characterizationModule: Module;
  relations: Record<RelationKey, RelationConfig>;
};
