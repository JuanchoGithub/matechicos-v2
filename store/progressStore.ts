import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TopicStats {
  completions: number;
  longestStreak: number;
  bestTime?: number; // For timed challenges, in milliseconds
  medals?: {
    bronze?: boolean;
    silver?: boolean;
    gold?: boolean;
    platinum?: boolean;
    rainbow?: boolean;
  };
}

export interface TopicProgress {
  stage: number;
  correctInStage: number;
}

interface ProgressState {
  completedExercises: Record<string, boolean>;
  streak: number;
  topicStats: Record<string, TopicStats>;
  topicProgress: Record<string, TopicProgress>;
  addCompletedExercise: (exerciseId: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  recordCompletion: (topicId: string, exerciseIdsToClear: string[], currentStreak: number, time?: number) => void;
  updateChallengeStats: (topicId: string, streak: number, score: number, isTrollMode: boolean, trollStageReached: number, didWin: boolean) => void;
  recordCorrectAnswerForTopic: (topicId: string, stageThreshold: number) => void;
  getTopicProgress: (topicId: string) => TopicProgress;
}

const initialTopicStats: TopicStats = {
  completions: 0,
  longestStreak: 0,
  medals: {},
};

const initialTopicProgress: TopicProgress = {
  stage: 1,
  correctInStage: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedExercises: {},
      streak: 0,
      topicStats: {},
      topicProgress: {},

      getTopicProgress: (topicId: string) => {
        return get().topicProgress[topicId] || { ...initialTopicProgress };
      },

      addCompletedExercise: (exerciseId) =>
        set((state) => ({
          completedExercises: { ...state.completedExercises, [exerciseId]: true },
        })),

      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

      resetStreak: () => set({ streak: 0 }),
      
      recordCorrectAnswerForTopic: (topicId, stageThreshold) => {
        const currentProgress = get().getTopicProgress(topicId);
        let { stage, correctInStage } = currentProgress;

        correctInStage++;

        if (correctInStage >= stageThreshold && stage < 3) {
          stage++;
          correctInStage = 0;
        }
        
        set((state) => ({
          topicProgress: {
            ...state.topicProgress,
            [topicId]: { stage, correctInStage },
          },
        }));
      },
      
      updateChallengeStats: (topicId, streak, score, isTrollMode, trollStageReached, didWin) => {
        set((state) => {
          const currentStats = state.topicStats[topicId] || { ...initialTopicStats };
          const newMedals = { ...(currentStats.medals || {}) };
      
          if (isTrollMode) {
            if (trollStageReached >= 2) { // Reached Nivel 2 (1s)
              newMedals.platinum = true;
            }
            if (didWin) { // Completed Troll Mode
              newMedals.rainbow = true;
            }
          } else {
            if (score >= 40) newMedals.bronze = true;
            if (score >= 60) newMedals.silver = true;
            if (didWin) newMedals.gold = true;
          }
          
          const newStats: TopicStats = {
            ...currentStats,
            completions: didWin ? currentStats.completions + 1 : currentStats.completions,
            longestStreak: Math.max(currentStats.longestStreak, streak),
            medals: newMedals,
          };
      
          return {
            topicStats: {
              ...state.topicStats,
              [topicId]: newStats,
            },
          };
        });
      },

      recordCompletion: (topicId, exerciseIdsToClear, currentStreak, time) => {
        const currentStats = get().topicStats[topicId] || { ...initialTopicStats };
        const newStats: TopicStats = {
          completions: currentStats.completions + 1,
          longestStreak: Math.max(currentStats.longestStreak, currentStreak),
          bestTime: currentStats.bestTime,
          medals: currentStats.medals, // Preserve medals
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

        // Reset topic progress on full completion
        const newTopicProgress = { ...get().topicProgress };
        delete newTopicProgress[topicId];

        set((state) => ({
          topicStats: {
            ...state.topicStats,
            [topicId]: newStats,
          },
          completedExercises: newCompletedExercises,
          topicProgress: newTopicProgress,
        }));
      },
    }),
    {
      name: 'mathkids-progress-storage',
    }
  )
);