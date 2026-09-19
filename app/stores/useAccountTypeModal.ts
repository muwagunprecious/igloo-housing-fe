import { create } from "zustand";

interface AccountTypeModalStore {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useAccountTypeModal = create<AccountTypeModalStore>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));
