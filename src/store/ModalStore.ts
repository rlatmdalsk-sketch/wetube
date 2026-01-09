import { create } from "zustand";

type ModalType = "LOGIN_REQUIRED" | "VIDEO_DETAIL" | "ADDRESS_SEARCH" | null;

interface ModalState {
    isOpen: boolean;
    type: ModalType;
    props?: any;

    openModal: (type: ModalType, props?: any) => void;
    closeModal: VoidFunction;
}

export const useModalStore = create<ModalState>()(set => ({
    isOpen: false,
    type: null,
    props: undefined,

    openModal: (type: ModalType, props) => set({ isOpen: true, type, props }),
    closeModal: () => set({ isOpen: false, type: null, props: null }),
}));
