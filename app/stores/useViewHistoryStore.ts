"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ViewHistoryStore {
    viewedProperties: string[]; // Array of property IDs (most recent first)
    addView: (id: string) => void;
    getRecentViews: (limit?: number) => string[];
}

export const useViewHistoryStore = create<ViewHistoryStore>()(
    persist(
        (set, get) => ({
            viewedProperties: [],
            addView: (id) => set((state) => {
                // Remove if already exists, then add to front
                const filtered = state.viewedProperties.filter((viewId) => viewId !== id);
                // Keep only last 20 views
                const updated = [id, ...filtered].slice(0, 20);
                return { viewedProperties: updated };
            }),
            getRecentViews: (limit = 6) => get().viewedProperties.slice(0, limit),
        }),
        {
            name: 'igloo-view-history',
        }
    )
);
