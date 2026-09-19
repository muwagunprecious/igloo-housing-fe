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
    pendingProperties?: number;
    approvedProperties?: number;
    propertyStats?: {
        total: number;
        pending: number;
        approved: number;
    };
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
    nin?: string;
    whatsapp?: string;
    verificationFeePaid?: boolean;
    verificationStatus?: string;
    universityId?: string;
    university?: {
        id: string;
        name: string;
    };
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
    video?: string | null;
    bedrooms?: number;
    bathrooms?: number;
    rooms?: number;
    roommatesAllowed?: boolean;
    distanceFromSchool?: string;
    createdAt: string;
    agent: {
        id: string;
        fullName: string;
        email: string;
        avatar?: string;
        whatsapp?: string;
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
            const rawList = Array.isArray(response.data.data) ? response.data.data : [];
            const validProperties = rawList.map((p: any) => {
                let images: string[] = [];
                if (Array.isArray(p.images)) {
                    images = p.images;
                } else if (typeof p.images === 'string' && p.images.trim()) {
                    try {
                        const parsed = JSON.parse(p.images);
                        images = Array.isArray(parsed) ? parsed : [p.images];
                    } catch {
                        images = [p.images];
                    }
                }
                return {
                    ...p,
                    images,
                    agent: p.agent || {
                        id: p.agentId || '',
                        fullName: 'Unknown Agent',
                        email: 'unknown@igloo.ng',
                        isVerified: false
                    }
                };
            });
            set({ properties: validProperties, isLoading: false });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('fetchProperties error:', error);
            set({ error: error.message, isLoading: false, properties: [] });
        }
    },

    approveProperty: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/admin/property/approve/${id}`);
            set((state) => ({
                properties: state.properties.filter((p) => p.id !== id),
                stats: state.stats ? {
                    ...state.stats,
                    pendingProperties: Math.max(0, (state.stats.pendingProperties ?? 1) - 1),
                    approvedProperties: (state.stats.approvedProperties ?? 0) + 1,
                } : null,
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
                stats: state.stats ? {
                    ...state.stats,
                    pendingProperties: Math.max(0, (state.stats.pendingProperties ?? 1) - 1),
                } : null,
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
