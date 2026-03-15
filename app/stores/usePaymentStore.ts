"use client";

import { create } from 'zustand';

interface PaymentStore {
    propertyId: string | null;
    amount: number;
    duration: string;
    paymentMethod: 'card' | 'bank' | 'wallet' | null;
    transactionId: string | null;
    cardDetails: {
        name: string;
        number: string;
        expiry: string;
        cvv: string;
    };
    setPropertyId: (id: string) => void;
    setAmount: (amount: number) => void;
    setDuration: (duration: string) => void;
    setPaymentMethod: (method: 'card' | 'bank' | 'wallet') => void;
    setCardDetails: (details: Partial<PaymentStore['cardDetails']>) => void;
    completePayment: () => void;
    resetPayment: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
    propertyId: null,
    amount: 0,
    duration: '',
    paymentMethod: null,
    transactionId: null,
    cardDetails: {
        name: '',
        number: '',
        expiry: '',
        cvv: '',
    },
    setPropertyId: (id) => set({ propertyId: id }),
    setAmount: (amount) => set({ amount }),
    setDuration: (duration) => set({ duration }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setCardDetails: (details) => set((state) => ({
        cardDetails: { ...state.cardDetails, ...details }
    })),
    completePayment: () => {
        const txId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
        set({ transactionId: txId });
    },
    resetPayment: () => set({
        propertyId: null,
        amount: 0,
        duration: '',
        paymentMethod: null,
        transactionId: null,
        cardDetails: { name: '', number: '', expiry: '', cvv: '' },
    }),
}));
