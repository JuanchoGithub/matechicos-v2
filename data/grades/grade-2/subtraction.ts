
import { Exercise, ExerciseType } from '../../../types';

export const subtractionExercises: Exercise[] = [
  { id: 's1', type: ExerciseType.NumberInput, question: '5 - 2 = ?', answer: 3, difficulty: 1 },
  { id: 's2', type: ExerciseType.MultipleChoice, question: '10 - 4 = ?', options: ['5', '6', '7'], answer: '6', difficulty: 1 },
  { id: 's3', type: ExerciseType.NumberInput, question: '8 - 8 = ?', answer: 0, difficulty: 2 },
];
