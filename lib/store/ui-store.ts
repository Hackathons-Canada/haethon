"use client";

import { create } from "zustand";

type ViewMode = "list" | "map";

type UiState = {
  mobileNavOpen: boolean;
  viewMode: ViewMode;
  setMobileNavOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  viewMode: "list",
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
