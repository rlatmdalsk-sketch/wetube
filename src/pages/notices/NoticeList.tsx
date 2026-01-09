import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router"; // react-router -> react-router-dom
import { fetchNotices, type Notice } from "../../api/notice";
import dayjs from "dayjs"; // ✨ dayjs import
import { useAuthStore } from "../../store/authStore"; // ✨ 관리자 체크용
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination.tsx"; // ✨ 글쓰기 버튼용

export default function NoticeList() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user); // 현재 로그인한 유저 정보

    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const LIMIT = 10; // 한 페이지당 개수

    useEffect(() => {
        loadNotices(currentPage).then(() => {});
    }, [currentPage]);

    const loadNotices = async (page: number) => {
        try {
            const data = await fetchNotices(page, LIMIT);
            setNotices(data.notices);
            setTotalPage(data.totalPages);
        } catch (error) {
            console.error("Failed to load notices", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-text-default">공지사항</h1>

                {/* ✨ 관리자(ADMIN)일 때만 글쓰기 버튼 노출 */}
                {user?.role === "ADMIN" && (
                    <Button onClick={() => navigate("/notices/create")}>글쓰기</Button>
                )}
            </div>

            <div className="bg-background-paper border border-divider rounded-lg overflow-hidden shadow-sm">
                {/* 헤더 */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-background-default border-b border-divider text-sm font-medium text-text-disabled">
                    <div className="col-span-1 text-center">번호</div>
                    <div className="col-span-8">제목</div>
                    <div className="col-span-2 text-center">날짜</div>
                    <div className="col-span-1 text-center">조회</div>
                </div>

                {/* 목록 */}
                {loading ? (
                    <div className="p-8 text-center text-text-disabled">로딩 중...</div>
                ) : notices.length === 0 ? (
                    <div className="p-8 text-center text-text-disabled">
                        등록된 공지사항이 없습니다.
                    </div>
                ) : (
                    notices.map(notice => (
                        <div
                            key={notice.id}
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-divider last:border-none hover:bg-background-default/50 transition-colors items-center">
                            <div className="col-span-1 text-center text-text-disabled text-sm">
                                {notice.id}
                            </div>
                            <div className="col-span-8">
                                <Link
                                    to={`/notices/${notice.id}`}
                                    className="text-text-default hover:text-primary-main font-medium transition-colors line-clamp-1">
                                    {notice.title}
                                </Link>
                            </div>
                            <div className="col-span-2 text-center text-text-disabled text-sm">
                                {/* ✨ Day.js 적용 (YYYY.MM.DD 형식) */}
                                {dayjs(notice.createdAt).format("YYYY.MM.DD")}
                            </div>
                            <div className="col-span-1 text-center text-text-disabled text-sm">
                                {notice.viewCount}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ✨ 페이지네이션 컴포넌트 사용 */}
            {!loading && notices.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPage={totalPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
