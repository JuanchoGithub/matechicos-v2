import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attempt } from '../types';

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
    diamond?: boolean;
  };
  totalSolved?: number;
  bestTimeFor10?: number; // In milliseconds
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
  attempts: Attempt[];
  addCompletedExercise: (exerciseId: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  recordCompletion: (topicId: string, exerciseIdsToClear: string[], currentStreak: number, time?: number, dailyProgress?: { speed?: number; decomposition?: number; problem?: number; epic?: number; clues?: number }) => void;
  updateChallengeStats: (topicId: string, streak: number, score: number, isTrollMode: boolean, trollStageReached: number, didWin: boolean) => void;
  recordCorrectAnswerForTopic: (topicId: string, stageThreshold: number) => void;
  getTopicProgress: (topicId: string) => TopicProgress;
  addAttempt: (attempt: Attempt) => void;
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
      attempts: [],

      getTopicProgress: (topicId: string) => {
        return get().topicProgress[topicId] || { ...initialTopicProgress };
      },

      addAttempt: (attempt) => set((state) => ({
        attempts: [attempt, ...state.attempts].slice(0, 50) // Keep last 50 attempts
      })),

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

      recordCompletion: (topicId, exerciseIdsToClear, currentStreak, time, dailyProgress) => {
        const currentStats = get().topicStats[topicId] || { ...initialTopicStats };
        const newMedals = { ...(currentStats.medals || {}) };

        // Medal logic for Daily Challenge
        if (topicId === 'daily-challenge' && dailyProgress) {
          const totalPossible = 18; // 10 speed + 5 decomposition + 1 problem + 1 epic + 1 clues
          const totalCorrect = (dailyProgress.speed || 0) + (dailyProgress.decomposition || 0) + (dailyProgress.problem || 0) + (dailyProgress.epic || 0) + (dailyProgress.clues || 0);
          const percentage = (totalCorrect / totalPossible) * 100;
          
          if (percentage >= 60) newMedals.bronze = true;
          if (percentage >= 80) newMedals.silver = true;
          if (percentage >= 90) newMedals.gold = true;
          if (percentage >= 100) newMedals.diamond = true;
        }

        // Medal logic for Learn the Table
        if (topicId.startsWith('learn-table-')) {
          const newTotalSolved = (currentStats.totalSolved || 0) + 10; // Each session is 10
          if (newTotalSolved >= 30) newMedals.bronze = true;
          if (newTotalSolved >= 50) newMedals.silver = true;
          
          if (time !== undefined) {
            const avgTime = time / 10;
            if (avgTime < 2000) newMedals.gold = true;
            if (avgTime < 1000) newMedals.diamond = true;
          }
          
          currentStats.totalSolved = newTotalSolved;
        }

        const newStats: TopicStats = {
          ...currentStats,
          completions: currentStats.completions + 1,
          longestStreak: Math.max(currentStats.longestStreak, currentStreak),
          bestTime: currentStats.bestTime,
          medals: newMedals,
        };

        if (time !== undefined) {
          if (newStats.bestTime === undefined || time < newStats.bestTime) {
            newStats.bestTime = time;
          }
          if (topicId.startsWith('learn-table-')) {
            if (newStats.bestTimeFor10 === undefined || time < newStats.bestTimeFor10) {
              newStats.bestTimeFor10 = time;
            }
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