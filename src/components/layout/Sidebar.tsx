import { Link, useLocation } from "react-router";
import { useLayoutStore } from "../../store/layoutStore";
import { useAuthStore } from "../../store/authStore";
import { twMerge } from "tailwind-merge";
import { MdHome, MdSubscriptions, MdHistory, MdThumbUp, MdAccountBox } from "react-icons/md";
import Backdrop from "../ui/Backdrop"; // Backdrop 재사용

export default function Sidebar() {
    const { pathname } = useLocation();
    const { isSidebarOpen, closeSidebar } = useLayoutStore(); // closeSidebar 가져오기
    const { user, isLoggedIn } = useAuthStore();

    // 메뉴 아이템 정의 (기존과 동일)
    const menuItems = [
        { icon: MdHome, text: "홈", path: "/" },
        { icon: MdSubscriptions, text: "구독", path: "/channels/subscriptions" },
        { icon: MdHistory, text: "시청 기록", path: "/videos/history" },
    ];

    const userMenuItems = [
        { icon: MdThumbUp, text: "좋아요 표시한 동영상", path: "/playlist/liked" },
        { icon: MdAccountBox, text: "내 채널", path: user ? `/channels/${user.id}` : "/sign-in" },
    ];

    // 모바일에서 메뉴 클릭 시 사이드바 닫기
    const handleMenuClick = () => {
        // 화면이 작을 때(sm 미만)만 닫기 동작 수행
        if (window.innerWidth < 640) {
            closeSidebar();
        }
    };

    return (
        <>
            {/* 1. 모바일용 백드롭 (사이드바가 열려있고, 모바일 화면일 때만 표시) */}
            {isSidebarOpen && (
                <div className="sm:hidden">
                    <Backdrop onClose={closeSidebar} className="bg-black/50 z-30" />
                </div>
            )}

            {/* 2. 사이드바 본체 */}
            <aside
                className={twMerge(
                    "fixed left-0 top-14 bottom-0 bg-background-paper border-r border-divider overflow-y-auto transition-all duration-200 z-40",
                    // ✨ 공통: 모바일 기본 너비는 w-60
                    "w-60",

                    // 📱 모바일 동작:
                    // isSidebarOpen이면 보이고(translate-x-0), 아니면 화면 밖으로 숨김(-translate-x-full)
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full",

                    // 🖥️ 데스크탑(sm 이상) 동작:
                    // 항상 보임(sm:translate-x-0)
                    // 열려있으면 너비 유지(sm:w-60), 닫혀있으면 미니 모드(sm:w-[72px])
                    "sm:translate-x-0",
                    isSidebarOpen ? "sm:w-60" : "sm:w-[72px]",
                )}>
                <div className="flex flex-col p-3 gap-1">
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.text}
                            {...item}
                            isActive={pathname === item.path}
                            isOpen={isSidebarOpen}
                            onClick={handleMenuClick} // 클릭 시 닫기 연결
                        />
                    ))}

                    <div className="my-2 border-t border-divider" />

                    {isLoggedIn &&
                        userMenuItems.map(item => (
                            <MenuItem
                                key={item.text}
                                {...item}
                                isActive={pathname === item.path}
                                isOpen={isSidebarOpen}
                                onClick={handleMenuClick}
                            />
                        ))}

                    {/* 로그인 유도 문구 (데스크탑 확장 모드 or 모바일 열림 상태일 때만) */}
                    {!isLoggedIn && isSidebarOpen && (
                        <div className="p-4 text-sm text-text-default">
                            <p className="mb-3">
                                로그인하면 동영상에 좋아요를 표시하고 댓글을 달거나 구독할 수
                                있습니다.
                            </p>
                            <Link
                                to="/sign-in"
                                onClick={handleMenuClick}
                                className="inline-flex items-center justify-center px-4 py-1.5 border border-divider rounded-full text-secondary-main font-medium hover:bg-secondary-main/10 transition-colors">
                                로그인
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

// MenuItem에 onClick 프롭 추가
function MenuItem({ icon: Icon, text, path, isActive, isOpen, onClick }: any) {
    return (
        <Link
            to={path}
            onClick={onClick}
            className={twMerge(
                "flex items-center gap-5 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                    ? "bg-text-default/10 text-text-default font-semibold"
                    : "text-text-default hover:bg-text-default/5",
                // 데스크탑 미니 모드(닫힘)일 때만 가운데 정렬
                // 모바일은 항상 열린 상태(w-60)로 나오므로 justify-start 유지
                !isOpen && "sm:justify-center sm:px-0",
            )}
            title={text}>
            <Icon
                className={twMerge("w-6 h-6 flex-shrink-0", isActive ? "text-primary-main" : "")}
            />

            {/* 텍스트 표시 조건:
                1. 모바일: 항상 표시 (사이드바가 보이면 무조건 w-60이므로)
                2. 데스크탑: isOpen일 때만 표시
            */}
            <span
                className={twMerge(
                    "text-sm truncate",
                    // 데스크탑에서 닫혀있으면 숨김
                    !isOpen && "sm:hidden",
                )}>
                {text}
            </span>
        </Link>
    );
}
