import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore.ts";
import { useEffect, useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios.ts";
import type { AxiosError } from "axios";
import { MdCloudUpload, MdImage } from "react-icons/md";
import Input from "../../components/ui/Input.tsx";
import Button from "../../components/ui/Button.tsx";

interface UploadFormData {
    title: string;
    description: string;
    video: FileList; // 파일 입력은 FileList 타입입니다
    thumbnail: FileList;
}

function VideoUpload() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // ✨ 해시태그 관리 State
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    // 로그인 안 한 유저 튕겨내기
    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/sign-in");
        }
    }, [user, navigate]);

    const {
        register,
        handleSubmit,
        watch, // 입력값 실시간 감시 (미리보기용)
        formState: { errors, isSubmitting },
    } = useForm<UploadFormData>();

    // 파일 선택 감지 (미리보기 URL 생성용)
    const videoFile = watch("video");
    const thumbnailFile = watch("thumbnail");

    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    // 비디오 파일 선택 시 미리보기 생성
    // URL.createObjectURL : 사용자가 선택한 파일을 브라우저 메모리에 임시 URL로 만들어서, 즉시 미리보기 가능하게 처리
    useEffect(() => {
        if (videoFile && videoFile.length > 0) {
            const file = videoFile[0];
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
            // 메모리 누수 방지 (컴포넌트 언마운트 시 해제는 생략했지만 실무엔 필요)
            return () => URL.revokeObjectURL(url);
        }
    }, [videoFile]);

    // 썸네일 파일 선택 시 미리보기 생성
    useEffect(() => {
        if (thumbnailFile && thumbnailFile.length > 0) {
            const file = thumbnailFile[0];
            const url = URL.createObjectURL(file);
            setThumbnailPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [thumbnailFile]);

    // ✨ 태그 입력 핸들러
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // 엔터나 콤마를 입력했을 때
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault(); // 폼 제출 방지
            const newTag = tagInput.trim().replace(/^#/, ""); // # 제거 및 공백 제거

            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setTagInput("");
            }
        }
    };

    // ✨ 태그 삭제 핸들러
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const onSubmit = async (data: UploadFormData) => {
        try {
            // 1. FormData 객체 생성
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("video", data.video[0]); // 실제 파일 객체 추가
            formData.append("thumbnail", data.thumbnail[0]);

            // ✨ 해시태그 배열을 JSON 문자열로 변환해서 추가
            formData.append("hashtags", JSON.stringify(tags));


            // 2. 서버 전송
            await api.post("/videos", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // 필수 헤더!
                },
            });

            alert("업로드가 완료되었습니다!");
            navigate("/"); // 홈으로 이동
        } catch (error) {
            console.error(error);
            const axiosError = error as AxiosError<{ message: string }>;
            const msg = axiosError.response?.data?.message || "업로드 실패";
            alert(msg);
        }
    };

    return (
        <div className="flex justify-center bg-background-default py-10 px-4 min-h-[calc(100vh-56px)]">
            <div className="w-full max-w-[800px] space-y-6">
                <h1 className="text-2xl font-bold text-text-default">동영상 업로드</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* 1. 비디오 업로드 & 미리보기 영역 */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-default">
                            동영상 파일
                        </label>
                        <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-divider rounded-lg bg-background-paper hover:bg-text-default/5 transition-colors overflow-hidden">
                            {videoPreview ? (
                                <video
                                    src={videoPreview}
                                    className="w-full h-full object-contain bg-black"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-text-disabled">
                                    <MdCloudUpload className="w-10 h-10 mb-3" />
                                    <p className="mb-2 text-sm">
                                        <span className="font-semibold">클릭하여 업로드</span> 또는
                                        드래그
                                    </p>
                                    <p className="text-xs">MP4, WebM (최대 500MB)</p>
                                </div>
                            )}

                            {/* 투명한 Input을 위에 덮어씌움 */}
                            <input
                                type="file"
                                accept="video/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                {...register("video", { required: "비디오 파일을 선택해주세요." })}
                            />
                        </div>
                        {errors.video && (
                            <p className="text-error-main text-xs">{errors.video.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 2. 정보 입력 (왼쪽) */}
                        <div className="md:col-span-2 space-y-4">
                            <Input
                                label="제목"
                                placeholder="동영상 제목을 입력하세요"
                                error={errors.title?.message}
                                registration={register("title", { required: "제목은 필수입니다." })}
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-text-default">
                                    설명
                                </label>
                                <textarea
                                    className="w-full h-32 rounded-md border border-divider bg-background-default px-3 py-2 text-sm text-text-default placeholder:text-text-disabled focus:outline-none focus:border-secondary-main resize-none"
                                    placeholder="동영상에 대한 설명을 입력하세요"
                                    {...register("description", {
                                        required: "설명은 필수입니다.",
                                    })}></textarea>
                                {errors.description && (
                                    <span className="text-xs text-error-main">
                                        {errors.description.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 3. 썸네일 업로드 (오른쪽) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-default">
                                썸네일
                            </label>
                            <div className="relative w-full aspect-video border border-divider rounded-md bg-background-paper overflow-hidden flex items-center justify-center group">
                                {thumbnailPreview ? (
                                    <img
                                        src={thumbnailPreview}
                                        alt="thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-text-disabled flex flex-col items-center">
                                        <MdImage className="w-8 h-8 mb-1" />
                                        <span className="text-xs">이미지 업로드</span>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    {...register("thumbnail", {
                                        required: "썸네일을 선택해주세요.",
                                    })}
                                />

                                {/* 호버 시 안내 */}
                                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-sm font-medium pointer-events-none">
                                    변경하기
                                </div>
                            </div>
                            {errors.thumbnail && (
                                <p className="text-error-main text-xs">
                                    {errors.thumbnail.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ✨ 해시태그 입력 영역 (설명 textarea 아래에 추가 추천) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-default">
                            해시태그
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 border border-divider rounded-md bg-background-default focus-within:border-secondary-main focus-within:ring-1 focus-within:ring-secondary-main">
                            {/* 입력된 태그들 표시 */}
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1 bg-secondary-main/10 text-secondary-main px-2 py-1 rounded-full text-sm">
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-error-main">
                                        &times;
                                    </button>
                                </span>
                            ))}

                            {/* 태그 입력 인풋 */}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="태그 입력 후 엔터 (예: 브이로그)"
                                className="flex-1 min-w-[120px] bg-transparent outline-none text-text-default placeholder:text-text-disabled"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "업로드 중..." : "업로드"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VideoUpload;
