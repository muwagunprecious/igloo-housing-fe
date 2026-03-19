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
    video?: string;
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
        whatsapp?: string;
    };
}

interface PropertyStore {
    properties: Property[];
    currentProperty: Property | null;
    isLoading: boolean;
    error: string | null;
    fetchProperties: (filters?: Record<string, string>) => Promise<void>;
    fetchProperty: (id: string) => Promise<void>;
    
    // NEW: Added methods for Editing and Deleting
    deleteProperty: (id: string) => Promise<boolean>;
    updateProperty: (id: string, propertyData: Partial<Property>) => Promise<boolean>;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
    properties: [],
    currentProperty: null,
    isLoading: false,
    error: null,

    fetchProperties: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const params = filters ? new URLSearchParams(filters).toString() : "";
            const response = await api.get(`/properties${params ? `?${params}` : ""}`);

            // Safely parse images (they are stored as JSON strings)
            const validProperties = response.data.data.map((p: any) => {
                let images = [];
                try {
                    images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
                } catch (e) {
                    console.error("Failed to parse property images", e);
                }
                return { ...p, images };
            });

            set({ properties: validProperties, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchProperty: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/properties/${id}`);
            
            // Safely parse the single property's images as well
            let parsedImages = [];
            const rawImages = response.data.data.images;
            try {
                parsedImages = typeof rawImages === 'string' ? JSON.parse(rawImages) : (rawImages || []);
            } catch (e) {
                console.error("Failed to parse single property images", e);
            }
            
            set({ 
                currentProperty: { ...response.data.data, images: parsedImages }, 
                isLoading: false 
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    // NEW: Delete Property Implementation
  deleteProperty: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/properties/${id}`);
            
            set((state) => ({
                properties: state.properties.filter(p => p.id !== id),
                currentProperty: state.currentProperty?.id === id ? null : state.currentProperty,
                isLoading: false
            }));
            return true;
        } catch (error: any) {
            // NEW: Log the exact backend error response
            console.error("DELETE ERROR:", error.response?.data || error.message);
            set({ error: error.message, isLoading: false });
            return false;
        }
    },

    updateProperty: async (id, propertyData) => {
        set({ isLoading: true, error: null });
        try {
            await api.patch(`/properties/${id}`, propertyData);
            
            set((state) => ({
                properties: state.properties.map(p => p.id === id ? { ...p, ...propertyData } : p),
                currentProperty: state.currentProperty?.id === id ? { ...state.currentProperty, ...propertyData } as Property : state.currentProperty,
                isLoading: false
            }));
            return true;
        } catch (error: any) {
            // NEW: Log the exact backend error response
            console.error("UPDATE ERROR:", error.response?.data || error.message);
            set({ error: error.message, isLoading: false });
            return false;
        }
    }
}));