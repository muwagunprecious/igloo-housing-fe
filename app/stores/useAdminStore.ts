import { create } from "zustand";
import api from "@/app/lib/axios";

export interface AdminStats {
    users: {
        total: number;
        students: number;
        agents: number;
        admins: number;
        blocked: number;
    };
    agents: {
        total: number;
        verified: number;
        pending: number;
    };
    properties: number;
    universities: number;
    messages: number;
    roommateRequests: number;
}

export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
}

export interface AdminProperty {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    images: string[] | string;
    createdAt: string;
    agent: {
        id: string;
        fullName: string;
        email: string;
        avatar?: string;
        isVerified: boolean;
    };
    university?: {
        name: string;
    };
}

interface AdminStore {
    properties: AdminProperty[];
    stats: AdminStats | null;
    users: AdminUser[];
    isLoading: boolean;
    error: string | null;
    fetchProperties: (status?: string) => Promise<void>;
    approveProperty: (id: string) => Promise<boolean>;
    rejectProperty: (id: string, reason: string) => Promise<boolean>;
    fetchStats: () => Promise<void>;
    fetchUsers: (filters?: any) => Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
    blockUser: (id: string, reason: string) => Promise<boolean>;
    unblockUser: (id: string) => Promise<boolean>;
    verifyAgent: (id: string) => Promise<boolean>;
    rejectAgent: (id: string, reason?: string) => Promise<boolean>;
    deleteProperty: (id: string, reason?: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminStore>((set) => ({
    properties: [],
    stats: null,
    users: [],
    isLoading: false,
    error: null,

    fetchProperties: async (status = 'PENDING') => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/properties?status=${status}`);
            const validProperties = response.data.data.map((p: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
            }));
            set({ properties: validProperties, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
        }
    },

    approveProperty: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/admin/property/approve/${id}`);
            set((state) => ({
                properties: state.properties.filter((p) => p.id !== id),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    rejectProperty: async (id: string, reason: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/admin/property/reject/${id}`, { reason });
            set((state) => ({
                properties: state.properties.filter((p) => p.id !== id),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/admin/stats');
            set({ stats: response.data.data, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
        }
    },

    fetchUsers: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/admin/users?${params}`);
            set({ users: response.data.data, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.message, isLoading: false });
        }
    },

    blockUser: async (id: string, reason: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/admin/block/${id}`, { reason });
            set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, isBlocked: true } : u),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    unblockUser: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/admin/unblock/${id}`);
            set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, isBlocked: false } : u),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    verifyAgent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/admin/agents/verify/${id}`);
            set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, isVerified: true } : u),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },

    rejectAgent: async (id: string, reason = 'Application rejected by admin') => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/admin/agents/reject/${id}`, { reason });
            set((state) => ({
                users: state.users.filter(u => u.id !== id),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    },
    deleteProperty: async (id: string, reason?: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/admin/property/${id}`, { data: { reason } });
            set((state) => ({
                properties: state.properties.filter((p) => p.id !== id),
                isLoading: false
            }));
            return true;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            set({ error: error.response?.data?.message || error.message, isLoading: false });
            return false;
        }
    }
}));
