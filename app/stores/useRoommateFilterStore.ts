"use client";

import { create } from 'zustand';

interface RoommateFilterStore {
    budgetRange: [number, number];
    lifestyle: string[];
    gender: string | null;
    campus: string;
    roomPreference: string;
    setFilter: <K extends keyof Omit<RoommateFilterStore, 'setFilter' | 'resetFilters'>>(
        key: K,
        value: RoommateFilterStore[K]
    ) => void;
    resetFilters: () => void;
}

const defaultFilters = {
    budgetRange: [0, 500000] as [number, number],
    lifestyle: [] as string[],
    gender: null as string | null,
    campus: '',
    roomPreference: '',
};

export const useRoommateFilterStore = create<RoommateFilterStore>((set) => ({
    ...defaultFilters,
    setFilter: (key, value) => set({ [key]: value }),
    resetFilters: () => set(defaultFilters),
}));
