import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/app/lib/axios";

interface User {
    id: string;
    email: string;
    name: string; // Mapped from fullName in backend
    role: "student" | "agent" | "admin";
    avatar?: string;
    bio?: string;
    universityId?: string;
    isVerified?: boolean;
    token?: string;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
    register: (fullName: string, email: string, password: string, role: "student" | "agent" | "admin", universityId?: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const responseData = response.data;
                    const { user: userData, token } = responseData.data;

                    const user: User = {
                        id: userData.id,
                        email: userData.email,
                        name: userData.fullName,
                        role: userData.role.toLowerCase(), // Ensure lowercase
                        avatar: userData.avatar,
                        universityId: userData.universityId,
                        isVerified: userData.isVerified,
                        token: token
                    };

                    set({ user, isAuthenticated: true, isLoading: false });

                    let redirectTo = '/dashboard';
                    if (user.role === 'agent') redirectTo = '/agents/dashboard';
                    if (user.role === 'admin') redirectTo = '/admin/dashboard';

                    return { success: true, redirectTo };
                } catch (error: any) {
                    console.error("Login error:", error);
                    set({ isLoading: false });
                    const message = error.response?.data?.message || error.message || "Login failed";
                    return { success: false, error: message };
                }
            },

            register: async (fullName, email, password, role, universityId) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register', { fullName, email, password, role, universityId });
                    const responseData = response.data;
                    const { user: userData, token } = responseData.data;

                    const user: User = {
                        id: userData.id,
                        email: userData.email,
                        name: userData.fullName,
                        role: userData.role.toLowerCase(), // Ensure lowercase
                        avatar: userData.avatar,
                        universityId: userData.universityId,
                        isVerified: userData.isVerified,
                        token: token
                    };

                    set({ user, isAuthenticated: true, isLoading: false });

                    let redirectTo = '/dashboard';
                    if (user.role === 'agent') redirectTo = '/agents/dashboard';
                    if (user.role === 'admin') redirectTo = '/admin/dashboard';

                    return { success: true, redirectTo };
                } catch (error: any) {
                    console.error("Registration error:", error);
                    set({ isLoading: false });
                    const message = error.response?.data?.message || error.message || "Registration failed";
                    return { success: false, error: message };
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const response = await api.get('/auth/me');
                    const userData = response.data.data; // Access data property from API response
                    const user: User = {
                        id: userData.id,
                        email: userData.email,
                        name: userData.fullName,
                        role: userData.role.toLowerCase(), // Ensure lowercase for frontend
                        avatar: userData.avatar,
                        bio: userData.bio,
                        universityId: userData.universityId,
                        isVerified: userData.isVerified,
                        // Token is presumed to be in storage if this succeeds, or we could store it separately
                    };
                    // We might need to keep the existing token if this is just a refresh/check
                    set((state) => ({
                        user: state.user ? { ...state.user, ...user } : user,
                        isAuthenticated: true,
                        isLoading: false
                    }));
                } catch (error) {
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            },

            updateUser: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                }));
            },
        }),
        {
            name: "igloo-auth-storage",
        }
    )
);
