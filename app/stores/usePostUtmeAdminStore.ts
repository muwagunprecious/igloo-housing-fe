import { create } from "zustand";
import api from "@/app/lib/axios";

interface PostUtmeAdminStats {
    totalProperties: number;
    pendingApproval: number;
    activeProperties: number;
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    totalRevenue: number;
    pendingPayouts: number;
    pendingRefunds: number;
    totalRenters: number;
    totalStudents: number;
}

interface PostUtmeAdminProperty {
    id: string;
    title: string;
    description: string;
    address: string;
    area: string;
    distanceFromOOU?: string;
    latitude?: number;
    longitude?: number;
    pricePerNight: number;
    fullBookingPrice?: number;
    totalRooms: number;
    availableRooms: number;
    totalBeds: number;
    maxGuests: number;
    checkInDate?: string;
    checkOutDate?: string;
    amenities: string;
    rules?: string;
    checkInInfo?: string;
    status: string;
    views: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    createdAt: string;
    owner?: { id: string; fullName: string; email: string; whatsapp?: string };
    images?: { id: string; url: string; order: number }[];
    _count?: { bookings: number };
}

interface PostUtmeAdminBooking {
    id: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    numberOfNights: number;
    totalPrice: number;
    serviceFee: number;
    totalPayable: number;
    status: string;
    verificationCode?: string;
    createdAt: string;
    property?: { id: string; title: string; address: string };
    student?: { id: string; fullName: string; email: string };
    renter?: { id: string; fullName: string; email: string };
    payment?: { status: string; reference: string };
}

interface PostUtmeAdminPayout {
    id: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    status: string;
    createdAt: string;
    renter?: { id: string; fullName: string; email: string };
}

interface PostUtmeAdminRefund {
    id: string;
    amount: number;
    reason: string;
    description: string;
    status: string;
    createdAt: string;
    booking?: { id: string; totalPrice: number; property?: { title: string } };
    student?: { id: string; fullName: string; email: string };
}

interface PostUtmeAdminState {
    stats: PostUtmeAdminStats | null;
    properties: PostUtmeAdminProperty[];
    propertiesTotal: number;
    currentProperty: PostUtmeAdminProperty | null;
    bookings: PostUtmeAdminBooking[];
    bookingsTotal: number;
    payouts: PostUtmeAdminPayout[];
    payoutsTotal: number;
    refunds: PostUtmeAdminRefund[];
    refundsTotal: number;
    isLoading: boolean;
    error: string | null;

    fetchStats: () => Promise<void>;
    fetchProperty: (id: string) => Promise<void>;
    fetchProperties: (params?: Record<string, string>) => Promise<void>;
    approveProperty: (id: string) => Promise<boolean>;
    rejectProperty: (id: string, reason?: string) => Promise<boolean>;
    suspendProperty: (id: string) => Promise<boolean>;
    fetchBookings: (params?: Record<string, string>) => Promise<void>;
    fetchPayouts: (params?: Record<string, string>) => Promise<void>;
    processPayout: (id: string, action: "approve" | "reject") => Promise<boolean>;
    fetchRefunds: (params?: Record<string, string>) => Promise<void>;
    processRefund: (id: string, action: "approve" | "reject") => Promise<boolean>;
    clearError: () => void;
}

export const usePostUtmeAdminStore = create<PostUtmeAdminState>()((set) => ({
    stats: null,
    properties: [],
    propertiesTotal: 0,
    currentProperty: null,
    bookings: [],
    bookingsTotal: 0,
    payouts: [],
    payoutsTotal: 0,
    refunds: [],
    refundsTotal: 0,
    isLoading: false,
    error: null,

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get("/post-utme/admin/stats");
            set({ stats: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch stats" });
        }
    },

    fetchProperty: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/post-utme/properties/${id}`);
            set({ currentProperty: response.data.data, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch property" });
        }
    },

    fetchProperties: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const query = params ? `?${new URLSearchParams(params).toString()}` : "";
            const response = await api.get(`/post-utme/admin/properties${query}`);
            const data = response.data.data;
            set({
                properties: data.properties || data,
                propertiesTotal: data.total || 0,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch properties" });
        }
    },

    approveProperty: async (id) => {
        try {
            await api.put(`/post-utme/admin/properties/${id}/approve`);
            set((state) => ({
                properties: state.properties.map((p) =>
                    p.id === id ? { ...p, status: "APPROVED", isVerified: true } : p
                ),
            }));
            return true;
        } catch {
            return false;
        }
    },

    rejectProperty: async (id, reason) => {
        try {
            await api.put(`/post-utme/admin/properties/${id}/reject`, { reason });
            set((state) => ({
                properties: state.properties.map((p) =>
                    p.id === id ? { ...p, status: "REJECTED" } : p
                ),
            }));
            return true;
        } catch {
            return false;
        }
    },

    suspendProperty: async (id) => {
        try {
            await api.put(`/post-utme/admin/properties/${id}/suspend`);
            set((state) => ({
                properties: state.properties.map((p) =>
                    p.id === id ? { ...p, status: "SUSPENDED" } : p
                ),
            }));
            return true;
        } catch {
            return false;
        }
    },

    fetchBookings: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const query = params ? `?${new URLSearchParams(params).toString()}` : "";
            const response = await api.get(`/post-utme/admin/bookings${query}`);
            const data = response.data.data;
            set({
                bookings: data.bookings || data,
                bookingsTotal: data.total || 0,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch bookings" });
        }
    },

    fetchPayouts: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const query = params ? `?${new URLSearchParams(params).toString()}` : "";
            const response = await api.get(`/post-utme/admin/payouts${query}`);
            const data = response.data.data;
            set({
                payouts: data.payouts || data.payoutRequests || (Array.isArray(data) ? data : []),
                payoutsTotal: data.total || 0,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch payouts" });
        }
    },

    processPayout: async (id, action) => {
        try {
            const uppercaseAction = action.toUpperCase();
            await api.put(`/post-utme/admin/payouts/${id}`, { action: uppercaseAction });
            set((state) => ({
                payouts: state.payouts.map((p) =>
                    p.id === id ? { ...p, status: uppercaseAction === "APPROVE" ? "APPROVED" : "REJECTED" } : p
                ),
            }));
            return true;
        } catch {
            return false;
        }
    },

    fetchRefunds: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const query = params ? `?${new URLSearchParams(params).toString()}` : "";
            const response = await api.get(`/post-utme/admin/refunds${query}`);
            const data = response.data.data;
            set({
                refunds: data.refunds || data.refundRequests || (Array.isArray(data) ? data : []),
                refundsTotal: data.total || 0,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch refunds" });
        }
    },

    processRefund: async (id, action) => {
        try {
            const uppercaseAction = action.toUpperCase();
            await api.put(`/post-utme/admin/refunds/${id}`, { action: uppercaseAction });
            set((state) => ({
                refunds: state.refunds.map((r) =>
                    r.id === id ? { ...r, status: uppercaseAction === "APPROVE" ? "APPROVED" : "REJECTED" } : r
                ),
            }));
            return true;
        } catch {
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));
