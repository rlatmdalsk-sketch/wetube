import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { deleteNotice, fetchNoticeDetail, type Notice } from "../../api/notice";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore.ts";

export default function NoticeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuthStore();

    useEffect(() => {
        if (id) {
            loadNotice(Number(id));
        }
    }, [id]);

    const loadNotice = async (noticeId: number) => {
        try {
            const data = await fetchNoticeDetail(noticeId);
            setNotice(data);
        } catch (error) {
            alert("공지사항을 불러오지 못했습니다.");
            navigate("/notices");
        } finally {
            setLoading(false);
        }
    };

    // ✨ 삭제 핸들러 구현
    const handleDelete = async () => {
        if (!id) return;

        // 1. 사용자 확인
        if (!window.confirm("정말 이 공지사항을 삭제하시겠습니까?")) {
            return;
        }

        try {
            // 2. 삭제 API 호출
            await deleteNotice(Number(id));
            alert("공지사항이 삭제되었습니다.");

            // 3. 목록으로 이동
            navigate("/notices");
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "삭제 권한이 없거나 오류가 발생했습니다.";
            alert(msg);
        }
    };

    if (loading) return <div className="py-20 text-center">로딩 중...</div>;
    if (!notice) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-background-paper border border-divider rounded-lg shadow-sm p-8">
                {/* 제목 헤더 */}
                <div className="border-b border-divider pb-6 mb-6">
                    <h1 className="text-2xl font-bold text-text-default mb-3">{notice.title}</h1>
                    <div className="flex justify-between items-center text-sm text-text-disabled">
                        <div className="flex gap-4">
                            <span>작성일: {new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span>조회수 {notice.viewCount}</span>
                    </div>
                </div>

                {/* 본문 내용 */}
                <div className="min-h-[200px] text-text-default leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                </div>

                <div className="border-t border-divider pt-6 mt-8 flex justify-between items-center">
                    <Button variant="secondary" onClick={() => navigate("/notices")}>
                        목록으로
                    </Button>

                    {/* ✨ 관리자 버튼 영역 */}
                    {user?.role === "ADMIN" && (
                        <div className="flex gap-2">
                            <Button
                                variant={"info"}
                                onClick={() => navigate(`/notices/${id}/edit`)} // ✨ 수정 페이지로 이동
                            >
                                수정
                            </Button>
                            <Button
                                variant="error" // 혹은 className="bg-error-main ..."
                                onClick={handleDelete}>
                                삭제
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
