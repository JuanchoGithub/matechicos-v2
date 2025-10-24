
export enum ExerciseType {
  MultipleChoice = 'multipleChoice',
  NumberInput = 'numberInput',
  DecompositionSubtraction = 'decompositionSubtraction',
  WordProblem = 'wordProblem',
  EpicWordProblem = 'epicWordProblem',
  ReasoningGauntlet = 'reasoningGauntlet',
}

export enum ExerciseMode {
  Standard = 'standard',
  StagedDecompositionSubtraction = 'stagedDecompositionSubtraction',
  StagedDecompositionAddition = 'stagedDecompositionAddition',
  StagedDecompositionMultiplication = 'stagedDecompositionMultiplication', // Retained for addition/subtraction structure
  PedagogicalDecompositionMultiplication = 'pedagogicalDecompositionMultiplication', // New step-by-step mode
  PedagogicalDecompositionDivision = 'pedagogicalDecompositionDivision',
  ReasoningGauntlet = 'reasoningGauntlet',
}

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  question: string;
  difficulty: number;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: ExerciseType.MultipleChoice;
  options: string[];
  answer: string;
}

export interface NumberInputExercise extends BaseExercise {
  type: ExerciseType.NumberInput;
  answer: number;
}

export interface DecompositionSubtractionExercise extends BaseExercise {
  type: ExerciseType.DecompositionSubtraction;
  minuend: number;
  subtrahend: number;
}

export interface WordProblemExercise extends BaseExercise {
  type: ExerciseType.WordProblem;
  problemText: string;
  numbers: number[];
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  answer: number;
  explanation: string;
  difficultyStage: number;
}

export interface EpicWordProblemExercise extends BaseExercise {
  type: ExerciseType.EpicWordProblem;
  problemText: string;
  numbers: number[];
  operations: ('addition' | 'subtraction' | 'multiplication' | 'division')[];
  answer: number;
  explanation: string;
}

export interface SolutionStep {
  name: string;
  numbers: (string | number)[]; // Can reference previous step name or be a raw number
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  result: number;
}

// Types for Reasoning Gauntlet number parsing
export interface SimpleNumberInText {
  text: string;
  value: number;
}

export interface TranslatableNumberInText {
  text: string;
  prompt: string;
  answer: number;
}

export type ProblemNumberInText = SimpleNumberInText | TranslatableNumberInText;


export interface ReasoningGauntletExercise extends BaseExercise {
    type: ExerciseType.ReasoningGauntlet;
    problemText: string;
    solution: SolutionStep[];
    explanation: string;
}


export type Exercise = MultipleChoiceExercise | NumberInputExercise | DecompositionSubtractionExercise | WordProblemExercise | EpicWordProblemExercise | ReasoningGauntletExercise;

export interface Topic {
  id: string;
  name: string;
  icon: string;
  exercises: Exercise[];
  challengeType?: 'timed-subtraction' | 'timed-addition' | 'timed-multiplication' | 'timed-division';
  exerciseMode?: ExerciseMode;
}

export interface Grade {
  id:string;
  level: number;
  name: string;
  topics: Topic[];
}

export interface StageConfig {
  name: string;
  total: number;
  time?: number;
}
