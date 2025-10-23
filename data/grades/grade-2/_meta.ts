
import { Topic } from '../../../types';
import { subtractionExercises } from './subtraction';
import { shapesExercises } from './shapes';

export const grade2Topics: Topic[] = [
  {
    id: 'subtraction',
    name: 'Restas Simples',
    icon: '➖',
    exercises: subtractionExercises,
  },
  {
    id: 'shapes',
    name: 'Figuras Geométricas',
    icon: '🟩',
    exercises: shapesExercises,
  },
];
