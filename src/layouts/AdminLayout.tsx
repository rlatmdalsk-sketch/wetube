import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { MdDashboard, MdPeople, MdLogout, MdHome, MdVideoLibrary } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "../store/authStore.ts";

export default function AdminLayout() {
    const { user, logout, isLoggedIn } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // 🔒 권한 체크: 관리자가 아니면 메인으로 쫓아냄
    useEffect(() => {
        if (!isLoggedIn || user?.role !== "ADMIN") {
            alert("관리자 권한이 필요합니다.");
            navigate("/", { replace: true });
        }
    }, [isLoggedIn, user, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/sign-in");
    };

    const menuItems = [
        { icon: MdDashboard, text: "대시보드", path: "/admin" },
        { icon: MdPeople, text: "회원 관리", path: "/admin/users" },
        { icon: MdVideoLibrary, text: "영상 관리", path: "/admin/videos" },
    ];

    // 로딩 중이거나 권한 체크 중일 때 깜빡임 방지용 (선택사항)
    if (!user || user.role !== "ADMIN") return null;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* 1. 관리자 사이드바 (Dark Theme & Fixed width) */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col shadow-xl z-50">
                {/* 로고 영역 */}
                <div className="h-16 flex items-center px-6 font-bold text-xl tracking-wider text-white border-b border-slate-800">
                    WeTube <span className="text-blue-500 ml-1">ADMIN</span>
                </div>

                {/* 메뉴 영역 */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={twMerge(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-slate-800 hover:text-white",
                                )}>
                                <item.icon
                                    className={twMerge(
                                        "w-5 h-5",
                                        isActive ? "text-white" : "text-slate-400",
                                    )}
                                />
                                {item.text}
                            </Link>
                        );
                    })}
                </nav>

                {/* 하단 버튼 영역 */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors mb-1">
                        <MdHome className="w-5 h-5" /> 메인 사이트 이동
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm rounded-lg transition-colors">
                        <MdLogout className="w-5 h-5" /> 로그아웃
                    </button>
                </div>
            </aside>

            {/* 2. 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* 관리자 탑 헤더 */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800">
                        {menuItems.find(m => m.path === location.pathname)?.text || "관리자 페이지"}
                    </h2>

                    {/* 관리자 프로필 요약 */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-800">{user.nickname}</p>
                            <p className="text-xs text-gray-500">Super Admin</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="admin"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold">
                                    A
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* 실제 페이지 콘텐츠 (Outlet) */}
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
