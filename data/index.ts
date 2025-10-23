
import { Grade } from '../types';
import { grade1Topics } from './grades/grade-1/_meta';
import { grade2Topics } from './grades/grade-2/_meta';
import { grade3Topics } from './grades/grade-3/_meta';

export const grades: Grade[] = [
  {
    id: 'grade-1',
    level: 1,
    name: '1er Grado',
    topics: grade1Topics,
  },
  {
    id: 'grade-2',
    level: 2,
    name: '2do Grado',
    topics: grade2Topics,
  },
  {
    id: 'grade-3',
    level: 3,
    name: '3er Grado',
    topics: grade3Topics,
  },
];
