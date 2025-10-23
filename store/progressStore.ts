import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TopicStats {
  completions: number;
  longestStreak: number;
  bestTime?: number; // For timed challenges, in milliseconds
}

interface ProgressState {
  completedExercises: Record<string, boolean>;
  streak: number;
  topicStats: Record<string, TopicStats>;
  addCompletedExercise: (exerciseId: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  recordCompletion: (topicId: string, exerciseIdsToClear: string[], currentStreak: number, time?: number) => void;
}

const initialTopicStats: TopicStats = {
  completions: 0,
  longestStreak: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedExercises: {},
      streak: 0,
      topicStats: {},

      addCompletedExercise: (exerciseId) =>
        set((state) => ({
          completedExercises: { ...state.completedExercises, [exerciseId]: true },
        })),

      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

      resetStreak: () => set({ streak: 0 }),

      recordCompletion: (topicId, exerciseIdsToClear, currentStreak, time) => {
        const currentStats = get().topicStats[topicId] || { ...initialTopicStats };
        const newStats: TopicStats = {
          completions: currentStats.completions + 1,
          longestStreak: Math.max(currentStats.longestStreak, currentStreak),
          bestTime: currentStats.bestTime,
        };

        if (time !== undefined) {
          if (newStats.bestTime === undefined || time < newStats.bestTime) {
            newStats.bestTime = time;
          }
        }

        const newCompletedExercises = { ...get().completedExercises };
        exerciseIdsToClear.forEach(id => {
          delete newCompletedExercises[id];
        });

        set((state) => ({
          topicStats: {
            ...state.topicStats,
            [topicId]: newStats,
          },
          completedExercises: newCompletedExercises,
        }));
      },
    }),
    {
      name: 'mathkids-progress-storage',
    }
  )
);
