import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchInquiryDetail, updateInquiry } from "../../api/inquiry";
import Button from "../../components/ui/Button";

export default function InquiryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    // 기존 데이터 로드
    useEffect(() => {
        if (id) loadData(Number(id));
    }, [id]);

    const loadData = async (inquiryId: number) => {
        try {
            const data = await fetchInquiryDetail(inquiryId);
            if (data.isAnswered) {
                alert("답변이 달린 글은 수정할 수 없습니다.");
                navigate(-1);
                return;
            }

            setTitle(data.title);
            setContent(data.content);
        } catch (error) {
            console.error(error);
            alert("데이터를 불러오지 못했습니다.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        if (!id) return;

        try {
            // ✨ 업데이트 API 호출
            await updateInquiry(Number(id), { title, content });
            alert("수정되었습니다.");
            navigate(`/inquiries/${id}`); // 상세 페이지로 복귀
        } catch (error) {
            console.error(error);
            alert("수정에 실패했습니다.");
        }
    };

    if (loading) return <div className="p-10 text-center">로딩 중...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold text-text-default mb-6">문의 내용 수정</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-default mb-1">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-background-paper border border-divider rounded-lg focus:border-primary-main outline-none text-text-default"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-default mb-1">내용</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full px-4 py-2 bg-background-paper border border-divider rounded-lg focus:border-primary-main outline-none text-text-default min-h-[200px] resize-none"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                        취소
                    </Button>
                    <Button type="submit">수정 완료</Button>
                </div>
            </form>
        </div>
    );
}
