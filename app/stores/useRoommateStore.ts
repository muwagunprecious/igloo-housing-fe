import { create } from "zustand";
import api from "@/app/lib/axios";

export interface RoommateRequest {
    id: string;
    propertyId: string | null;
    userId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED"; // Updated to match backend
    createdAt: string;
    budget: number | null;
    roomType: string | null;
    genderPref: string | null;
    bio: string | null;
    houseLink: string | null;
    media: string | null; // JSON string
    user: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
    property?: {
        id: string;
        title: string;
        location: string;
        images: string;
    };
}

interface RoommateStore {
    requests: RoommateRequest[];
    feed: RoommateRequest[];
    agentRequests: RoommateRequest[];
    isLoading: boolean;
    error: string | null;
    fetchMyRequests: () => Promise<void>;
    fetchFeed: (filters?: any) => Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
    fetchAgentRequests: () => Promise<void>;
    createRequest: (data: any) => Promise<boolean>; // eslint-disable-line @typescript-eslint/no-explicit-any
    deleteRequest: (id: string) => Promise<boolean>;
}

export const useRoommateStore = create<RoommateStore>((set) => ({
    requests: [],
    feed: [],
    agentRequests: [],
    isLoading: false,
    error: null,

    fetchMyRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/roommate/my-requests');
            set({ requests: response.data.data, isLoading: false }); // Backend uses Response wrapper
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
        }
    },

    fetchFeed: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/roommate/feed?${params}`);
            set({ feed: response.data.data, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
        }
    },

    fetchAgentRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/roommate/agent/requests');
            set({ agentRequests: response.data.data, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
        }
    },

    createRequest: async (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        set({ isLoading: true, error: null });
        try {
            await api.post('/roommate/request', data);
            set({ isLoading: false });
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    deleteRequest: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/roommate/request/${id}`);
            // Remove from local state
            set(state => ({
                requests: state.requests.filter(r => r.id !== id),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
            return false;
        }
    }
}));
