import { create } from "zustand";
import api from "@/app/lib/axios";

interface PostUtmeProperty {
    id: string;
    ownerId: string;
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
    updatedAt: string;
    owner?: { id: string; fullName: string; avatar?: string; whatsapp?: string };
    images?: { id: string; url: string; order: number }[];
    _count?: { bookings: number };
}

interface PostUtmeBooking {
    id: string;
    studentId: string;
    propertyId: string;
    renterId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    numberOfNights: number;
    totalPrice: number;
    serviceFee: number;
    totalPayable: number;
    status: string;
    verificationCode?: string;
    renterConfirmed: boolean;
    checkedInAt?: string;
    createdAt: string;
    property?: PostUtmeProperty & { images?: { url: string }[] };
    student?: { id: string; fullName: string; avatar?: string; whatsapp?: string };
    renter?: { id: string; fullName: string; avatar?: string; whatsapp?: string };
    payment?: { status: string; reference: string };
}

interface WalletData {
    walletBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalBookings: number;
    successfulBookings: number;
}

interface WalletTransaction {
    id: string;
    type: string;
    amount: number;
    balance: number;
    description: string;
    reference?: string;
    bookingId?: string;
    createdAt: string;
}

interface PayoutRequest {
    id: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    status: string;
    createdAt: string;
}

interface RefundRequest {
    id: string;
    bookingId: string;
    amount: number;
    reason: string;
    description: string;
    status: string;
    createdAt: string;
    booking?: PostUtmeBooking;
}

interface PaginatedResponse<T> {
    total: number;
    page: number;
    totalPages: number;
}

interface PostUtmeState {
    properties: PostUtmeProperty[];
    propertiesTotal: number;
    propertiesPage: number;
    propertiesTotalPages: number;
    currentProperty: PostUtmeProperty | null;
    
    myProperties: PostUtmeProperty[];
    
    studentBookings: PostUtmeBooking[];
    renterBookings: PostUtmeBooking[];
    currentBooking: PostUtmeBooking | null;
    
    wallet: WalletData | null;
    walletTransactions: WalletTransaction[];
    payoutRequests: PayoutRequest[];
    refundRequests: RefundRequest[];
    
    isLoading: boolean;
    error: string | null;

    // Property actions
    fetchProperties: (filters?: Record<string, string>) => Promise<void>;
    fetchProperty: (id: string) => Promise<void>;
    createProperty: (data: FormData) => Promise<{ success: boolean; id?: string }>;
    updateProperty: (id: string, data: FormData) => Promise<{ success: boolean }>;
    deleteProperty: (id: string) => Promise<boolean>;
    fetchMyProperties: () => Promise<void>;
    submitForReview: (id: string) => Promise<boolean>;
    addReview: (propertyId: string, rating: number, comment: string) => Promise<boolean>;

    // Booking actions
    createBooking: (data: { propertyId: string; checkInDate: string; checkOutDate: string; numberOfGuests: number }) => Promise<{ success: boolean; booking?: PostUtmeBooking }>;
    payBooking: (bookingId: string) => Promise<boolean>;
    fetchMyBookings: (status?: string) => Promise<void>;
    fetchRenterBookings: (status?: string) => Promise<void>;
    fetchBooking: (id: string) => Promise<void>;
    cancelBooking: (id: string) => Promise<boolean>;
    confirmArrival: (bookingId: string, code: string) => Promise<boolean>;
    updateBookingStatus: (bookingId: string, status: string) => Promise<boolean>;

    // Wallet actions
    fetchWallet: () => Promise<void>;
    fetchWalletTransactions: (page?: number) => Promise<void>;
    requestPayout: (data: { bankName: string; accountNumber: string; accountName: string; amount: number }) => Promise<boolean>;
    fetchMyPayouts: () => Promise<void>;

    // Refund actions
    requestRefund: (data: { bookingId: string; reason: string; description: string }) => Promise<boolean>;
    fetchMyRefunds: () => Promise<void>;

    // Reset
    clearError: () => void;
}

export const usePostUtmeStore = create<PostUtmeState>()((set, get) => ({
    properties: [],
    propertiesTotal: 0,
    propertiesPage: 1,
    propertiesTotalPages: 1,
    currentProperty: null,
    myProperties: [],
    studentBookings: [],
    renterBookings: [],
    currentBooking: null,
    wallet: null,
    walletTransactions: [],
    payoutRequests: [],
    refundRequests: [],
    isLoading: false,
    error: null,

    fetchProperties: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value);
                    }
                });
            }
            const response = await api.get(`/post-utme/properties?${params.toString()}`);
            const data = response.data.data;
            set({
                properties: data.properties,
                propertiesTotal: data.total,
                propertiesPage: data.page,
                propertiesTotalPages: data.totalPages,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch properties" });
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

    createProperty: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/post-utme/properties', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            set({ isLoading: false });
            return { success: true, id: response.data.data.id };
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to create property" });
            return { success: false };
        }
    },

    updateProperty: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/post-utme/properties/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            set({ isLoading: false });
            return { success: true };
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to update property" });
            return { success: false };
        }
    },

    deleteProperty: async (id) => {
        try {
            await api.delete(`/post-utme/properties/${id}`);
            set((state) => ({ myProperties: state.myProperties.filter((p) => p.id !== id) }));
            return true;
        } catch {
            return false;
        }
    },

    fetchMyProperties: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/post-utme/properties/renter/mine');
            set({ myProperties: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    submitForReview: async (id) => {
        try {
            await api.post(`/post-utme/properties/${id}/submit`);
            return true;
        } catch {
            return false;
        }
    },

    addReview: async (propertyId, rating, comment) => {
        try {
            await api.post(`/post-utme/properties/${propertyId}/reviews`, { rating, comment });
            return true;
        } catch {
            return false;
        }
    },

    createBooking: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/post-utme/bookings', data);
            set({ isLoading: false });
            return { success: true, booking: response.data.data };
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to create booking" });
            return { success: false };
        }
    },

    payBooking: async (bookingId) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/post-utme/bookings/${bookingId}/pay`);
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Payment failed" });
            return false;
        }
    },

    fetchMyBookings: async (status) => {
        set({ isLoading: true });
        try {
            const params = status ? `?status=${status}` : '';
            const response = await api.get(`/post-utme/bookings/mine${params}`);
            set({ studentBookings: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    fetchRenterBookings: async (status) => {
        set({ isLoading: true });
        try {
            const params = status ? `?status=${status}` : '';
            const response = await api.get(`/post-utme/bookings/renter/mine${params}`);
            set({ renterBookings: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    fetchBooking: async (id) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/post-utme/bookings/${id}`);
            set({ currentBooking: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    cancelBooking: async (id) => {
        try {
            await api.post(`/post-utme/bookings/${id}/cancel`);
            return true;
        } catch {
            return false;
        }
    },

    confirmArrival: async (bookingId, code) => {
        try {
            await api.post(`/post-utme/bookings/${bookingId}/verify`, { code });
            return true;
        } catch {
            return false;
        }
    },

    updateBookingStatus: async (bookingId, status) => {
        try {
            await api.put(`/post-utme/bookings/${bookingId}/status`, { status });
            return true;
        } catch {
            return false;
        }
    },

    fetchWallet: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/post-utme/wallet');
            set({ wallet: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    fetchWalletTransactions: async (page = 1) => {
        try {
            const response = await api.get(`/post-utme/wallet/transactions?page=${page}`);
            set({ walletTransactions: response.data.data.transactions });
        } catch {}
    },

    requestPayout: async (data) => {
        try {
            await api.post('/post-utme/payouts', data);
            return true;
        } catch {
            return false;
        }
    },

    fetchMyPayouts: async () => {
        try {
            const response = await api.get('/post-utme/payouts/mine');
            set({ payoutRequests: response.data.data.payoutRequests || response.data.data });
        } catch {}
    },

    requestRefund: async (data) => {
        try {
            await api.post('/post-utme/refunds', data);
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to submit refund request";
            toast.error(message);
            return false;
        }
    },

    fetchMyRefunds: async () => {
        try {
            const response = await api.get('/post-utme/refunds/mine');
            set({ refundRequests: response.data.data });
        } catch {}
    },

    clearError: () => set({ error: null }),
}));
