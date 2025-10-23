export enum ExerciseType {
  MultipleChoice = 'multipleChoice',
  NumberInput = 'numberInput',
  DecompositionSubtraction = 'decompositionSubtraction',
}

export enum ExerciseMode {
  Standard = 'standard',
  StagedDecompositionSubtraction = 'stagedDecompositionSubtraction',
  StagedDecompositionAddition = 'stagedDecompositionAddition',
  StagedDecompositionMultiplication = 'stagedDecompositionMultiplication', // Retained for addition/subtraction structure
  PedagogicalDecompositionMultiplication = 'pedagogicalDecompositionMultiplication', // New step-by-step mode
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

export type Exercise = MultipleChoiceExercise | NumberInputExercise | DecompositionSubtractionExercise;

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