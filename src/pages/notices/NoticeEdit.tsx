import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { fetchNoticeDetail, updateNotice } from "../../api/notice";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

interface NoticeEditFormData {
    title: string;
    content: string;
}

export default function NoticeEdit() {
    const { id } = useParams(); // URL에서 id 가져오기
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // 1. 관리자 체크
    useEffect(() => {
        if (!user || user.role !== "ADMIN") {
            alert("관리자 권한이 필요합니다.");
            navigate("/notices");
        }
    }, [user, navigate]);

    const {
        register,
        handleSubmit,
        setValue, // 데이터를 폼에 넣기 위해 필요
        formState: { errors, isSubmitting },
    } = useForm<NoticeEditFormData>();

    // 2. 기존 데이터 불러오기
    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const data = await fetchNoticeDetail(Number(id));
                // 폼에 기존 데이터 채워넣기
                setValue("title", data.title);
                setValue("content", data.content);
            } catch (error) {
                alert("데이터를 불러오지 못했습니다.");
                navigate("/notices");
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, [id, setValue, navigate]);

    // 3. 수정 요청
    const onSubmit = async (data: NoticeEditFormData) => {
        if (!id) return;
        try {
            await updateNotice(Number(id), data);
            alert("공지사항이 수정되었습니다.");
            navigate(`/notices/${id}`); // 상세 페이지로 이동
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "수정에 실패했습니다.";
            alert(msg);
        }
    };

    if (!user || user.role !== "ADMIN") return null;
    if (isLoadingData) return <div className="py-20 text-center">데이터 로딩 중...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 min-h-[calc(100vh-56px)]">
            <h1 className="text-2xl font-bold mb-6 text-text-default">공지사항 수정</h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 bg-background-paper p-6 rounded-lg border border-divider shadow-sm">
                {/* 제목 */}
                <div className="flex flex-col gap-2">
                    <Input
                        label="제목"
                        placeholder="공지사항 제목"
                        error={errors.title?.message}
                        registration={register("title", { required: "제목은 필수입니다." })}
                    />
                </div>

                {/* 내용 */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-default">내용</label>
                    <textarea
                        className="w-full h-80 p-3 rounded-md border border-divider bg-background-default text-text-default placeholder:text-text-disabled focus:outline-none focus:border-secondary-main resize-none transition-colors"
                        placeholder="내용을 입력하세요"
                        {...register("content", { required: "내용은 필수입니다." })}
                    />
                    {errors.content && (
                        <span className="text-xs text-error-main">{errors.content.message}</span>
                    )}
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-divider">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate(`/notices/${id}`)}>
                        취소
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="w-24">
                        {isSubmitting ? "수정 중..." : "수정하기"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
