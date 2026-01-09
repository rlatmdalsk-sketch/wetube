import Header from "../components/layout/Header.tsx";
import { Outlet } from "react-router";
import { useThemeStore } from "../store/themeStore.ts";
import { useEffect } from "react";
import GlobalModal from "../components/ui/GlobalModal.tsx";
import Sidebar from "../components/layout/Sidebar.tsx";
import { twMerge } from "tailwind-merge";
import { useLayoutStore } from "../store/layoutStore.ts";

function Layout() {
    const theme = useThemeStore(state => state.theme);
    const { isSidebarOpen } = useLayoutStore();

    // ✨ 테마 변경 감지 및 HTML 클래스 적용
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    return (
        <div className="min-h-screen pt-14">
            <Header />
            <div className={twMerge(["flex", "pt-14"])}>
                <Sidebar />

                <main
                    className={twMerge(
                        ["flex-1", "p-4", "transition-all", "duration-200", "ml-0"],
                        isSidebarOpen ? "sm:ml-60" : "sm:ml-18",
                    )}>
                    <Outlet /> {/* 실제 페이지 내용이 들어가는 곳 */}
                </main>
            </div>

            {/* ✨ 여기에 전역 모달 배치 */}
            <GlobalModal />
        </div>
    );
}

export default Layout;
