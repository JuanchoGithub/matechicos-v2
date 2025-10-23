
import { Topic } from '../../../types';
import { countingExercises } from './counting';
import { additionExercises } from './addition';

export const grade1Topics: Topic[] = [
  {
    id: 'counting',
    name: 'Contar',
    icon: '🔢',
    exercises: countingExercises,
  },
  {
    id: 'addition',
    name: 'Sumas Simples',
    icon: '➕',
    exercises: additionExercises,
  },
];
