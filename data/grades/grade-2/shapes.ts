
import { Exercise, ExerciseType } from '../../../types';

export const shapesExercises: Exercise[] = [
  { id: 'g1', type: ExerciseType.MultipleChoice, question: '¿Cuántos lados tiene un cuadrado?', options: ['3', '4', '5'], answer: '4', difficulty: 1 },
  { id: 'g2', type: ExerciseType.MultipleChoice, question: '¿Qué figura es redonda?', options: ['Triángulo', 'Círculo', 'Rectángulo'], answer: 'Círculo', difficulty: 1 },
];
