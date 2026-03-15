"use client";

import { create } from 'zustand';

interface BookingStore {
    propertyId: string | null;
    checkIn: Date | null;
    checkOut: Date | null;
    duration: string; // e.g., "1 semester", "1 year"
    guests: number;
    totalPrice: number;
    step: number;
    setPropertyId: (id: string) => void;
    setDates: (checkIn: Date, checkOut: Date) => void;
    setDuration: (duration: string) => void;
    setGuests: (guests: number) => void;
    setTotalPrice: (price: number) => void;
    setStep: (step: number) => void;
    resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
    propertyId: null,
    checkIn: null,
    checkOut: null,
    duration: '',
    guests: 1,
    totalPrice: 0,
    step: 1,
    setPropertyId: (id) => set({ propertyId: id }),
    setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
    setDuration: (duration) => set({ duration }),
    setGuests: (guests) => set({ guests }),
    setTotalPrice: (price) => set({ totalPrice: price }),
    setStep: (step) => set({ step }),
    resetBooking: () => set({
        propertyId: null,
        checkIn: null,
        checkOut: null,
        duration: '',
        guests: 1,
        totalPrice: 0,
        step: 1,
    }),
}));
