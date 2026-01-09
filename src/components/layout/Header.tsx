import { Link, useNavigate } from "react-router";
import {
    MdAccountBox,
    MdAdminPanelSettings,
    MdCampaign,
    MdDarkMode,
    MdEdit,
    MdHistory,
    MdLightMode,
    MdLogout,
    MdMenu,
    MdNotifications,
    MdSearch,
    MdSupportAgent,
    MdVideoCall,
} from "react-icons/md";
import { FaRegUserCircle, FaYoutube } from "react-icons/fa";
import { useAuthStore } from "../../store/authStore.ts";
import { useThemeStore } from "../../store/themeStore.ts";
import { useState, type MouseEvent, type FormEvent } from "react";
import Backdrop from "../ui/Backdrop.tsx";
import { useModalStore } from "../../store/ModalStore.ts";
import Avatar from "../ui/Avatar.tsx";
import { useLayoutStore } from "../../store/layoutStore.ts";

function Header() {
    const navigate = useNavigate();

    const { user, isLoggedIn, logout } = useAuthStore();

    const theme = useThemeStore(state => state.theme);
    const toggleTheme = useThemeStore(state => state.toggleTheme);

    const { openModal } = useModalStore();
    const { toggleSidebar } = useLayoutStore();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate("/");
    };

    const handleUploadClick = (e: MouseEvent) => {
        if (!isLoggedIn) {
            e.preventDefault(); // 링크 이동 막기
            openModal("LOGIN_REQUIRED"); // ✨ 전역 모달 열기!
        }
    };

    const [keyword, setKeyword] = useState("");
    const handleSearch = (e: FormEvent) => {
        e.preventDefault(); // 페이지 리로드 방지
        if (!keyword.trim()) return;

        // 검색 결과 페이지로 이동
        navigate(`/results?q=${keyword}`);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-14 bg-background-paper border-b border-divider flex items-center justify-between px-4 z-50 transition-colors duration-200">
                {/* 1. 왼쪽: 메뉴 및 로고 */}
                <div className="flex items-center gap-4">
                    <button
                        className="p-2 hover:bg-text-default/10 rounded-full transition-colors text-text-default"
                        onClick={toggleSidebar}>
                        <MdMenu className="w-6 h-6" />
                    </button>
                    <Link to="/" className="flex items-center gap-1">
                        {/* Primary Color (Youtube Red) 적용 */}
                        <FaYoutube className="w-8 h-8 text-primary-main" />
                        <span className="text-xl font-bold tracking-tighter text-text-default font-sans relative bottom-[1px]">
                            WeTube
                        </span>
                    </Link>
                </div>

                {/* 2. 중앙: 검색창 */}
                <form
                    onSubmit={handleSearch}
                    className="hidden sm:flex flex-1 max-w-[600px] items-center mx-4">
                    <div className="flex w-full">
                        <input
                            type="text"
                            placeholder="검색"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            className="w-full bg-background-default border border-divider rounded-l-full px-4 py-2 text-text-default placeholder:text-text-disabled focus:outline-none focus:border-secondary-main ml-8 shadow-inner"
                        />
                        <button
                            type={"submit"}
                            className="bg-background-paper border border-l-0 border-divider rounded-r-full px-5 py-2 hover:bg-text-default/5 transition-colors">
                            <MdSearch className="w-6 h-6 text-text-default" />
                        </button>
                    </div>
                </form>

                {/* 3. 오른쪽: 로그인 버튼 */}
                {/* 3. 오른쪽: 로그인 상태에 따라 분기 처리 */}
                <div className="flex items-center gap-2">
                    {/* ✨ 공지사항 버튼 (로그인 여부 상관없이 노출) */}
                    <Link
                        to="/notices"
                        className="p-2 hover:bg-text-default/10 rounded-full text-text-default inline-flex items-center justify-center"
                        title="공지사항">
                        <MdCampaign className="w-6 h-6" />
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:bg-text-default/10 rounded-full text-text-default transition-colors"
                        title={theme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"}>
                        {theme === "dark" ? (
                            <MdLightMode className="w-6 h-6" />
                        ) : (
                            <MdDarkMode className="w-6 h-6" />
                        )}
                    </button>
                    <Link
                        onClick={handleUploadClick}
                        to="/videos/upload"
                        className="p-2 hover:bg-text-default/10 rounded-full text-text-default inline-flex items-center justify-center"
                        title="만들기">
                        <MdVideoCall className="w-7 h-7" />
                    </Link>
                    {isLoggedIn && user ? (
                        /* ✨ 로그인 했을 때 보여줄 UI */
                        <>
                            <button
                                className="p-2 hover:bg-text-default/10 rounded-full text-text-default"
                                title="알림">
                                <MdNotifications className="w-6 h-6" />
                            </button>

                            {/* ✨ 프로필 메뉴 영역 (relative) */}
                            <div className="relative ml-2">
                                {/* 아바타 버튼 */}
                                <Avatar
                                    src={user.profileImage}
                                    nickname={user.nickname}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                />

                                {/* ✨ 드롭다운 메뉴 (조건부 렌더링) */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-60 bg-background-paper border border-divider rounded-xl shadow-lg py-2 overflow-hidden z-50">
                                        {/* 유저 정보 */}
                                        <div className="px-4 py-3 border-b border-divider">
                                            <p className="text-text-default font-semibold truncate">
                                                {user.nickname}
                                            </p>
                                            <p className="text-text-disabled text-xs truncate">
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* 메뉴 링크들 */}
                                        <div className="py-2">
                                            <Link
                                                to="/users/edit"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-default hover:bg-text-default/10 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}>
                                                <MdEdit className="w-5 h-5 text-text-disabled" />
                                                프로필 수정
                                            </Link>
                                            <Link
                                                to={`/channels/${user.id}`}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-default hover:bg-text-default/10 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}>
                                                <MdAccountBox className="w-5 h-5 text-text-disabled" />
                                                내 채널
                                            </Link>
                                            {/* ✨ 시청 기록 링크 추가 */}
                                            <Link
                                                to="/videos/history"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-default hover:bg-text-default/10 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}>
                                                <MdHistory className="w-5 h-5 text-text-disabled" />{" "}
                                                {/* react-icons/md 에서 import 필요 */}
                                                시청 기록
                                            </Link>
                                            {/* ✨ 1:1 문의 메뉴 여기로 이동 */}
                                            <Link
                                                to="/inquiries"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-default hover:bg-text-default/10 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}>
                                                <MdSupportAgent className="w-5 h-5 text-text-disabled" />
                                                고객센터 (1:1 문의)
                                            </Link>
                                        </div>

                                        <div className="border-t border-divider my-1"></div>

                                        {user.role === "ADMIN" && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-info-main hover:bg-text-default/5 text-sm font-medium"
                                            >
                                                <MdAdminPanelSettings className="w-6 h-6" />
                                                관리자 페이지
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-main hover:bg-error-main/5 transition-colors text-left">
                                            <MdLogout className="w-5 h-5" />
                                            로그아웃
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* ☁️ 로그인 안 했을 때 (기존) */
                        <Link
                            to="/sign-in" // 경로 수정 반영
                            className="flex items-center gap-2 p-2 px-4 border border-divider rounded-full text-secondary-main font-medium hover:bg-secondary-main/10 transition-colors">
                            <FaRegUserCircle className="w-5 h-5" />
                            <span className="text-sm">로그인</span>
                        </Link>
                    )}
                </div>
            </header>
            {/* ✨ 투명 백드롭: 메뉴가 열려있을 때만 표시 */}
            {isMenuOpen && (
                <Backdrop onClose={() => setIsMenuOpen(false)} className="z-40 bg-transparent" />
            )}
        </>
    );
}

export default Header;
