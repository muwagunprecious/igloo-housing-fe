import { create } from "zustand";
import api from "@/app/lib/axios";

interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    address?: string; // Fallback for location
    category: string;
    bedrooms: number;
    bathrooms: number;
    rooms: number;
    roommatesAllowed: boolean;
    isAvailable: boolean;
    status: string; // PENDING, APPROVED, REJECTED or Available, Booked
    images: string[];
    video?: string;
    amenities: string[];
    agentId: string;
    universityId: string;
    createdAt: string;
}

interface AgentPropertiesStore {
    properties: Property[];
    isLoading: boolean;
    error: string | null;
    fetchProperties: () => Promise<void>;
    addProperty: (formData: FormData) => Promise<boolean>;
    updateProperty: (id: string, formData: FormData) => Promise<boolean>;
    deleteProperty: (id: string) => Promise<boolean>;
    getProperty: (id: string) => Property | undefined;
}

export const useAgentPropertiesStore = create<AgentPropertiesStore>((set, get) => ({
    properties: [],
    isLoading: false,
    error: null,

    fetchProperties: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/properties?agent=me');
            const data = response.data.data || response.data;

            // Safe parse images
            const validProperties = Array.isArray(data) ? data.map((p: any) => {
                let images = [];
                try {
                    images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
                } catch (e) {
                    console.error("Failed to parse agent property images", e);
                }
                return { ...p, images };
            }) : [];

            set({ properties: validProperties, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addProperty: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/properties', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newProperty = response.data.data || response.data;
            set((state) => ({
                properties: [newProperty, ...state.properties],
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    updateProperty: async (id: string, formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/properties/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const updatedProperty = response.data.data || response.data;
            set((state) => ({
                properties: state.properties.map((p) =>
                    p.id === id ? updatedProperty : p
                ),
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    deleteProperty: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/properties/${id}`);
            set((state) => ({
                properties: state.properties.filter((p) => p.id !== id),
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    getProperty: (id: string) => {
        return get().properties.find((p) => p.id === id);
    },
}));
