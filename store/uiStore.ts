import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  statusBarContent: React.ReactNode | null;
  setStatusBarContent: (content: React.ReactNode | null) => void;
  clearStatusBarContent: () => void;
  headerContent: React.ReactNode | null;
  setHeaderContent: (content: React.ReactNode | null) => void;
  clearHeaderContent: () => void;
  isTestMode: boolean;
  toggleTestMode: () => void;
  sidebarPosition: 'left' | 'right';
  toggleSidebarPosition: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  overrideStreak: number | null;
  setOverrideStreak: (streak: number | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      statusBarContent: null,
      setStatusBarContent: (content) => set({ statusBarContent: content }),
      clearStatusBarContent: () => set({ statusBarContent: null }),
      headerContent: null,
      setHeaderContent: (content) => set({ headerContent: content }),
      clearHeaderContent: () => set({ headerContent: null }),
      isTestMode: false,
      toggleTestMode: () => set((state) => ({ isTestMode: !state.isTestMode })),
      sidebarPosition: 'right',
      toggleSidebarPosition: () =>
        set((state) => ({
          sidebarPosition: state.sidebarPosition === 'right' ? 'left' : 'right',
        })),
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      overrideStreak: null,
      setOverrideStreak: (streak) => set({ overrideStreak: streak }),
    }),
    {
      name: 'mathkids-ui-storage',
      partialize: (state) => ({
        sidebarPosition: state.sidebarPosition,
        theme: state.theme,
      }),
    }
  )
);