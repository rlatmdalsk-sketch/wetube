import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { createInquiry } from "../../api/inquiry";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

interface FormData {
    title: string;
    content: string;
}

export default function InquiryCreate() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            await createInquiry(data);
            alert("문의가 등록되었습니다.");
            navigate("/inquiries");
        } catch (error) {
            alert("등록 실패");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-6 text-text-default">문의하기</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 bg-background-paper p-6 rounded-lg border border-divider">
                <Input
                    label="제목"
                    placeholder="제목을 입력하세요"
                    error={errors.title?.message}
                    registration={register("title", { required: "제목은 필수입니다." })}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-default">내용</label>
                    <textarea
                        className="w-full h-60 p-3 rounded-md border border-divider bg-background-default text-text-default focus:border-secondary-main outline-none resize-none"
                        placeholder="문의하실 내용을 입력해주세요."
                        {...register("content", { required: "내용은 필수입니다." })}
                    />
                    {errors.content && (
                        <span className="text-xs text-error-main">내용을 입력해주세요.</span>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-divider pt-4">
                    <Button type="button" variant="ghost" onClick={() => navigate("/inquiries")}>
                        취소
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        등록하기
                    </Button>
                </div>
            </form>
        </div>
    );
}
