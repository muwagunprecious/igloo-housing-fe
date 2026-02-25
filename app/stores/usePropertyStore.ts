import { create } from "zustand";
import api from "@/app/lib/axios";

export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    address?: string;
    images: string[];
    category?: string;
    bedrooms?: number;
    bathrooms?: number;
    rooms?: number;
    roommatesAllowed: boolean;
    isAvailable?: boolean;
    status?: string;
    agentId?: string;
    universityId?: string;
    createdAt?: string;
    agent?: {
        id: string;
        fullName: string;
        avatar?: string;
        email: string;
    };
}

interface PropertyStore {
    properties: Property[];
    currentProperty: Property | null;
    isLoading: boolean;
    error: string | null;
    fetchProperties: (filters?: any) => Promise<void>;
    fetchProperty: (id: string) => Promise<void>;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
    properties: [],
    currentProperty: null,
    isLoading: false,
    error: null,

    fetchProperties: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/properties?${params}`);

            // Parse images from JSON string if needed
            const validProperties = response.data.data.map((p: any) => ({
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
            }));

            set({ properties: validProperties, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchProperty: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/properties/${id}`);
            set({ currentProperty: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    }
}));
