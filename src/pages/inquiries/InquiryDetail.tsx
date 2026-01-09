import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchInquiryDetail, deleteInquiry, deleteAnswer, type Inquiry } from "../../api/inquiry"; // API import 확인
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import dayjs from "dayjs";
import { MdDelete, MdEdit } from "react-icons/md";

export default function InquiryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore(); // 현재 로그인한 유저 정보

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadData(Number(id));
    }, [id]);

    const loadData = async (inquiryId: number) => {
        try {
            const data = await fetchInquiryDetail(inquiryId);
            setInquiry(data);
        } catch (error) {
            console.error("로드 실패", error);
            alert("문의 내용을 불러오지 못했습니다.");
            navigate("/inquiries");
        } finally {
            setLoading(false);
        }
    };

    // ✨ 1. 문의 삭제 핸들러
    const handleDeleteInquiry = async () => {
        if (!window.confirm("정말 이 문의를 삭제하시겠습니까?")) return;
        try {
            if (inquiry) {
                await deleteInquiry(inquiry.id);
                alert("삭제되었습니다.");
                navigate("/inquiries");
            }
        } catch (error) {
            console.error(error);
            alert("삭제에 실패했습니다.");
        }
    };

    // ✨ 2. 답변 삭제 핸들러 (관리자용)
    const handleDeleteAnswer = async () => {
        if (!window.confirm("등록된 답변을 삭제하시겠습니까?")) return;
        try {
            if (inquiry) {
                await deleteAnswer(inquiry.id);
                // 화면 새로고침 없이 데이터만 갱신
                loadData(inquiry.id);
            }
        } catch (error) {
            console.error(error);
            alert("답변 삭제 실패");
        }
    };

    if (loading) return <div className="p-10 text-center text-text-disabled">로딩 중...</div>;
    if (!inquiry) return null;

    // 권한 체크
    const isAuthor = user?.id === inquiry.author?.id; // 작성자 본인 여부
    const isAdmin = user?.role === "ADMIN"; // 관리자 여부

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-text-default">문의 내용</h1>
                <Button variant="secondary" onClick={() => navigate("/inquiries")}>
                    목록으로
                </Button>
            </div>

            {/* 문의 본문 영역 */}
            <div className="bg-background-paper border border-divider rounded-lg p-6 mb-6">
                <div className="border-b border-divider pb-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className={`text-xs px-2 py-1 rounded-full ${inquiry.isAnswered ? "bg-success-main/10 text-success-main" : "bg-text-disabled/10 text-text-disabled"}`}>
                            {inquiry.isAnswered ? "답변완료" : "대기중"}
                        </span>
                        <span className="text-sm text-text-disabled">
                            {dayjs(inquiry.createdAt).format("YYYY.MM.DD HH:mm")}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-text-default">{inquiry.title}</h2>
                </div>
                <div className="min-h-[100px] text-text-default whitespace-pre-wrap">
                    {inquiry.content}
                </div>

                {/* 버튼 영역: 작성자 본인 또는 관리자일 때 노출 */}
                {(isAuthor || isAdmin) && (
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-divider">
                        {/* 수정 버튼: 본인만 가능 (관리자는 보통 내용 수정 안함) */}
                        {isAuthor && (
                            <Button
                                variant={"ghost"}
                                onClick={() => navigate(`/inquiries/${inquiry.id}/edit`)}>
                                <MdEdit /> 수정
                            </Button>
                        )}
                        {/* 삭제 버튼: 본인 또는 관리자 */}
                        <Button variant={"error"} onClick={handleDeleteInquiry}>
                            <MdDelete /> 삭제
                        </Button>
                    </div>
                )}
            </div>

            {/* 답변 영역 */}
            {inquiry.isAnswered && inquiry.answer ? (
                <div className="bg-background-default border border-divider rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-primary-main flex items-center gap-2">
                            Admin 답변
                            <span className="text-xs text-text-disabled font-normal">
                                {dayjs(inquiry.answeredAt).format("YYYY.MM.DD HH:mm")}
                            </span>
                        </h3>
                        {/* 관리자일 경우 답변 삭제 버튼 노출 */}
                        {isAdmin && (
                            <button
                                onClick={handleDeleteAnswer}
                                className="text-xs text-text-disabled hover:text-error-main underline">
                                답변 삭제
                            </button>
                        )}
                    </div>
                    <div className="text-text-default whitespace-pre-wrap">{inquiry.answer}</div>
                </div>
            ) : (
                // 답변이 없을 때 안내
                <div className="bg-background-default/50 border border-dashed border-divider rounded-lg p-8 text-center text-text-disabled">
                    아직 답변이 등록되지 않았습니다.
                </div>
            )}
        </div>
    );
}
