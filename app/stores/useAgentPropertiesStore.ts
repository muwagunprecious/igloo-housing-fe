import { create } from "zustand";
import api from "@/app/lib/axios";

export interface AgentProperty {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    campus: string;
    category: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    rooms: number;
    roommatesAllowed: boolean;
    isAvailable: boolean;
    status: string;
    views: number;
    createdAt: string;
    agent: {
        id: string;
        fullName: string;
        avatar?: string;
        email: string;
    };
}

interface AgentPropertiesStore {
    properties: AgentProperty[];
    currentProperty: AgentProperty | null;
    isLoading: boolean;
    error: string | null;

    fetchAgentProperties: (agentId?: string) => Promise<void>;
    fetchProperty: (id: string) => Promise<void>;
    addProperty: (formData: FormData) => Promise<boolean>;
    updateProperty: (id: string, formData: FormData) => Promise<boolean>;
    deleteProperty: (id: string) => Promise<boolean>;
    clearError: () => void;
}

export const useAgentPropertiesStore = create<AgentPropertiesStore>((set, get) => ({
    properties: [],
    currentProperty: null,
    isLoading: false,
    error: null,

    fetchAgentProperties: async (agentId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const url = agentId ? `/properties?agentId=${agentId}` : '/properties';
            const response = await api.get(url);

            // Safe parse images
            const validProperties = response.data.data.map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                let images = [];
                try {
                    images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
                } catch (e) {
                    console.error("Failed to parse agent property images", e);
                }
                return { ...p, images };
            });

            set({ properties: validProperties, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
        }
    },

    fetchProperty: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/properties/${id}`);
            const property = response.data.data;
            try {
                property.images = typeof property.images === 'string' ? JSON.parse(property.images) : (property.images || []);
            } catch (e) {
                console.error("Failed to parse agent property images detail", e);
                property.images = [];
            }
            set({ currentProperty: property, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
        }
    },

    addProperty: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/properties', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set({ isLoading: false });
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    updateProperty: async (id: string, formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/properties/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set({ isLoading: false });
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    deleteProperty: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/properties/${id}`);
            set((state) => ({
                properties: state.properties.filter(p => p.id !== id),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    clearError: () => set({ error: null })
}));
