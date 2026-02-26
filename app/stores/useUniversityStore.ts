import { create } from "zustand";
import api from "@/app/lib/axios";

export interface University {
    id: string;
    name: string;
    abbr: string;
    location: string;
    logo?: string;
    createdAt?: string;
}

interface UniversityStore {
    universities: University[];
    isLoading: boolean;
    error: string | null;
    fetchUniversities: () => Promise<void>;
    createUniversity: (data: Partial<University>) => Promise<boolean>;
    updateUniversity: (id: string, data: Partial<University>) => Promise<boolean>;
    deleteUniversity: (id: string) => Promise<boolean>;
}

export const useUniversityStore = create<UniversityStore>((set, get) => ({
    universities: [],
    isLoading: false,
    error: null,

    fetchUniversities: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/university');
            set({ universities: response.data, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
        }
    },

    createUniversity: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/university', data);
            set((state) => ({
                universities: [...state.universities, response.data],
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    updateUniversity: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/university/${id}`, data);
            set((state) => ({
                universities: state.universities.map((u) => u.id === id ? response.data : u),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    deleteUniversity: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/university/${id}`);
            set((state) => ({
                universities: state.universities.filter((u) => u.id !== id),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    }
}));
