
import { useProgressStore } from '../store/progressStore';
import { Topic } from '../types';

export const useProgress = (topic: Topic) => {
  const completedExercises = useProgressStore((state) => state.completedExercises);

  const completedCount = topic.exercises.filter(ex => completedExercises[ex.id]).length;
  const totalCount = topic.exercises.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return { completedCount, totalCount, progressPercentage };
};
