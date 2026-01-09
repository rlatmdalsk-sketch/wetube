import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

interface NoticeWriteFormData {
    title: string;
    content: string;
}

export default function NoticeCreate() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    // 1. 관리자 권한 체크 (페이지 진입 시)
    useEffect(() => {
        // 유저 정보가 없거나, 역할이 ADMIN이 아니면 쫓아냅니다.
        if (!user || user.role !== "ADMIN") {
            alert("관리자 권한이 필요합니다.");
            navigate("/notices");
        }
    }, [user, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<NoticeWriteFormData>();

    const onSubmit = async (data: NoticeWriteFormData) => {
        try {
            // POST /notices 요청
            await api.post("/notices", data);
            alert("공지사항이 등록되었습니다.");
            navigate("/notices");
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "등록에 실패했습니다.";
            alert(msg);
        }
    };

    // 권한 체크 중이거나 권한이 없으면 화면 렌더링 방지
    if (!user || user.role !== "ADMIN") return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 min-h-[calc(100vh-56px)]">
            <h1 className="text-2xl font-bold mb-6 text-text-default">공지사항 작성</h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 bg-background-paper p-6 rounded-lg border border-divider shadow-sm">
                {/* 제목 입력 */}
                <div className="flex flex-col gap-2">
                    <Input
                        label="제목"
                        placeholder="공지사항 제목을 입력하세요"
                        error={errors.title?.message}
                        registration={register("title", {
                            required: "제목은 필수입니다.",
                        })}
                    />
                </div>

                {/* 내용 입력 (TextArea는 별도 컴포넌트가 없으므로 직접 스타일링) */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-default">내용</label>
                    <textarea
                        className="w-full h-80 p-3 rounded-md border border-divider bg-background-default text-text-default placeholder:text-text-disabled focus:outline-none focus:border-secondary-main resize-none transition-colors"
                        placeholder="공지사항 내용을 입력하세요"
                        {...register("content", { required: "내용은 필수입니다." })}
                    />
                    {errors.content && (
                        <span className="text-xs text-error-main">{errors.content.message}</span>
                    )}
                </div>

                {/* 버튼 영역 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-divider">
                    <Button type="button" variant="ghost" onClick={() => navigate("/notices")}>
                        취소
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="w-24">
                        {isSubmitting ? "등록 중..." : "등록하기"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
