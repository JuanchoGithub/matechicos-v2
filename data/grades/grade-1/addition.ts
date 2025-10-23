
import { Exercise, ExerciseType } from '../../../types';

export const additionExercises: Exercise[] = [
  { id: 'a1', type: ExerciseType.NumberInput, question: '2 + 3 = ?', answer: 5, difficulty: 1 },
  { id: 'a2', type: ExerciseType.MultipleChoice, question: '1 + 1 = ?', options: ['1', '2', '3'], answer: '2', difficulty: 1 },
  { id: 'a3', type: ExerciseType.NumberInput, question: '4 + 5 = ?', answer: 9, difficulty: 2 },
  { id: 'a4', type: ExerciseType.MultipleChoice, question: '¿Qué suma da 10?', options: ['4+4', '5+5', '6+3'], answer: '5+5', difficulty: 2 },
  { id: 'a5', type: ExerciseType.NumberInput, question: 'Tenés 3 galletas y te dan 2 más. ¿Cuántas tenés?', answer: 5, difficulty: 3 },
];