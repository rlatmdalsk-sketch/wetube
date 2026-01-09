import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
    id: number;
    username: string;
    nickname: string;
    email: string;
    profileImage?: string | null;
    phoneNumber?: string;
    birthDate?: string;
    zipCode?: string;
    address1?: string;
    address2?: string;
    role: "USER" | "ADMIN";
    gender: "MALE" | "FEMALE";
}

interface AuthState {
    token: string | null;
    user: User | null;
    isLoggedIn: boolean;

    login: (token: string, user: User) => void;
    logout: VoidFunction;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            token: null,
            user: null,
            isLoggedIn: false,

            login: (token, user) => set({ token, user, isLoggedIn: true }),
            logout: () => set({ token: null, user: null, isLoggedIn: false }),
            updateUser: updatedData =>
                set(state => ({ user: state.user ? { ...state.user, ...updatedData } : null })),
        }),
        {
            name: "wetube-auth",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
