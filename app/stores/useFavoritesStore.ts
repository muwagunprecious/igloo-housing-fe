"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
    favorites: string[]; // Array of property IDs
    addFavorite: (id: string) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set, get) => ({
            favorites: [],
            addFavorite: (id) => set((state) => ({
                favorites: [...state.favorites, id]
            })),
            removeFavorite: (id) => set((state) => ({
                favorites: state.favorites.filter((fav) => fav !== id)
            })),
            isFavorite: (id) => get().favorites.includes(id),
            toggleFavorite: (id) => {
                const { isFavorite, addFavorite, removeFavorite } = get();
                if (isFavorite(id)) {
                    removeFavorite(id);
                } else {
                    addFavorite(id);
                }
            },
        }),
        {
            name: 'igloo-favorites',
        }
    )
);
