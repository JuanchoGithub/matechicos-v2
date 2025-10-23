
import { Exercise, ExerciseType } from '../../../types';

export const countingExercises: Exercise[] = [
  { id: 'c1', type: ExerciseType.NumberInput, question: '¿Cuántas manzanas hay? 🍎🍎🍎', answer: 3, difficulty: 1 },
  { id: 'c2', type: ExerciseType.MultipleChoice, question: '¿Qué número viene después del 5?', options: ['4', '6', '7'], answer: '6', difficulty: 1 },
  { id: 'c3', type: ExerciseType.NumberInput, question: 'Contá los plátanos: 🍌🍌🍌🍌🍌', answer: 5, difficulty: 1 },
  { id: 'c4', type: ExerciseType.MultipleChoice, question: '¿Cuál es el número más grande?', options: ['8', '2', '5'], answer: '8', difficulty: 2 },
  { id: 'c5', type: ExerciseType.NumberInput, question: '¿Cuántos dedos tenés en una mano?', answer: 5, difficulty: 2 },
];