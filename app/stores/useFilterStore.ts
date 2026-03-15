"use client";

import { create } from 'zustand';

export interface FilterState {
    priceRange: [number, number];
    roomTypes: string[];
    amenities: string[];
    distance: number;
    minRating: number;
    furnished: boolean | null; // null = both, true = furnished, false = unfurnished
}

interface FilterStore extends FilterState {
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    resetFilters: () => void;
    getActiveFilterCount: () => number;
}

const defaultFilters: FilterState = {
    priceRange: [0, 1000000],
    roomTypes: [],
    amenities: [],
    distance: 50,
    minRating: 0,
    furnished: null,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
    ...defaultFilters,
    setFilter: (key, value) => set({ [key]: value }),
    resetFilters: () => set(defaultFilters),
    getActiveFilterCount: () => {
        const state = get();
        let count = 0;
        if (state.priceRange[0] > 0 || state.priceRange[1] < 1000000) count++;
        if (state.roomTypes.length > 0) count++;
        if (state.amenities.length > 0) count++;
        if (state.distance < 50) count++;
        if (state.minRating > 0) count++;
        if (state.furnished !== null) count++;
        return count;
    },
}));
