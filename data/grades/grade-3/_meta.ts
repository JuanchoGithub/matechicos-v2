import { Topic, ExerciseMode } from '../../../types';
import { wordProblemExercises } from './word-problems';
import { epicWordProblemExercises } from './epic-word-problems';

export const grade3Topics: Topic[] = [
  {
    id: 'timed-subtraction-challenge',
    name: 'Restas: Desafío de Velocidad',
    icon: '⏱️',
    // No se necesitan ejercicios estáticos, se generan dinámicamente
    exercises: [], 
    challengeType: 'timed-subtraction',
  },
  {
    id: 'timed-addition-challenge',
    name: 'Sumas: Desafío de Velocidad',
    icon: '⚡️',
    exercises: [], 
    challengeType: 'timed-addition',
  },
  {
    id: 'timed-multiplication-challenge',
    name: 'Multiplicaciones: Desafío de Velocidad',
    icon: '🚀',
    exercises: [],
    challengeType: 'timed-multiplication',
  },
  {
    id: 'timed-division-challenge',
    name: 'Divisiones: Desafío de Velocidad',
    icon: '☄️',
    exercises: [],
    challengeType: 'timed-division',
  },
  {
    id: 'decomposition-subtraction',
    name: 'Restas por Descomposición',
    icon: '➖',
    exercises: [], // Dynamically generated
    exerciseMode: ExerciseMode.StagedDecompositionSubtraction,
  },
  {
    id: 'decomposition-addition',
    name: 'Sumas por Descomposición',
    icon: '➕',
    exercises: [], // Dynamically generated
    exerciseMode: ExerciseMode.StagedDecompositionAddition,
  },
  {
    id: 'decomposition-multiplication',
    name: 'Multiplicación por Descomposición',
    icon: '✖️',
    exercises: [], // Dynamically generated
    exerciseMode: ExerciseMode.PedagogicalDecompositionMultiplication,
  },
  {
    id: 'decomposition-division',
    name: 'Divisiones por Descomposición',
    icon: '➗',
    exercises: [], // Dynamically generated
    exerciseMode: ExerciseMode.PedagogicalDecompositionDivision,
  },
  {
    id: 'word-problems-add-subtract',
    name: 'Resolviendo Problemas',
    icon: '🧠',
    exercises: wordProblemExercises,
  },
  {
    id: 'epic-word-problems',
    name: 'Problemas Épicos',
    icon: '🦸‍♂️',
    exercises: epicWordProblemExercises,
  }
];