import React from 'react';
import { create } from 'zustand';

interface UiState {
  statusBarContent: React.ReactNode | null;
  setStatusBarContent: (content: React.ReactNode | null) => void;
  clearStatusBarContent: () => void;
  headerContent: React.ReactNode | null;
  setHeaderContent: (content: React.ReactNode | null) => void;
  clearHeaderContent: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  statusBarContent: null,
  setStatusBarContent: (content) => set({ statusBarContent: content }),
  clearStatusBarContent: () => set({ statusBarContent: null }),
  headerContent: null,
  setHeaderContent: (content) => set({ headerContent: content }),
  clearHeaderContent: () => set({ headerContent: null }),
}));
