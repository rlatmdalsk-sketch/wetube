import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutStore {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
}

export const useLayoutStore = create<LayoutStore>()(
    persist(
        set => ({
            isSidebarOpen: true, // 기본값: 열림 (데스크탑 기준)
            toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
            closeSidebar: () => set({ isSidebarOpen: false }),
        }),
        { name: "wetube-layout" },
    ),
);
