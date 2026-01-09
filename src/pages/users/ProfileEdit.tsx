import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { api } from "../../api/axios.ts";
import { useAuthStore } from "../../store/authStore.ts";
import Input from "../../components/ui/Input.tsx";
import Button from "../../components/ui/Button.tsx";
import { MdCameraAlt } from "react-icons/md";
import { useModalStore } from "../../store/ModalStore.ts";
import { twMerge } from "tailwind-merge";

// ✨ 성별, 생년월일 필드 추가
interface ProfileEditFormData {
    nickname: string;
    phoneNumber: string;
    zipCode: string;
    address1: string;
    address2: string;
    birthDate: string; // ✨ 추가
    gender: "MALE" | "FEMALE"; // ✨ 추가 (Prisma Enum과 일치시킴)
    profileImage: FileList;
}

export default function ProfileEdit() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const { openModal } = useModalStore(); // ✨

    // ✨ 닉네임 중복 확인 상태 관리
    // 초기값은 true (내 원래 닉네임은 유효함)
    const [isNicknameChecked, setIsNicknameChecked] = useState(true);
    const [nicknameMessage, setNicknameMessage] = useState("");

    // 로그인 체크
    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/sign-in");
        }
    }, [user, navigate]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        getValues,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<ProfileEditFormData>({
        // 기존 유저 정보로 초기값 설정
        defaultValues: {
            nickname: user?.nickname || "",
            phoneNumber: user?.phoneNumber || "",
            zipCode: user?.zipCode || "",
            address1: user?.address1 || "",
            address2: user?.address2 || "",
            birthDate: user?.birthDate || "", // ✨ 추가
            gender: (user?.gender as "MALE" | "FEMALE") || "MALE", // ✨ 추가 (기본값 MALE)
        },
    });

    // ✨ 닉네임 중복 확인 핸들러
    const handleCheckNickname = async () => {
        const nickname = getValues("nickname");

        if (!nickname) {
            setError("nickname", { message: "닉네임을 입력해주세요." });
            return;
        }

        // 1. 내 원래 닉네임과 같다면 API 호출 없이 통과
        if (user?.nickname === nickname) {
            setIsNicknameChecked(true);
            setNicknameMessage("현재 사용 중인 닉네임입니다.");
            clearErrors("nickname");
            return;
        }

        // 2. 다른 닉네임이라면 API 호출
        try {
            const response = await api.post("/auth/check-nickname", { nickname });
            const { isAvailable, message } = response.data;

            if (isAvailable) {
                setIsNicknameChecked(true);
                setNicknameMessage(message);
                clearErrors("nickname");
            } else {
                setIsNicknameChecked(false);
                setError("nickname", { message });
            }
        } catch (error) {
            console.error(error);
            setError("nickname", { message: "중복 확인 중 오류가 발생했습니다." });
        }
    };

    // 이미지 미리보기 로직
    const profileImageFileList = watch("profileImage");

    // 초기 이미지 경로 설정
    const getInitialImage = () => {
        if (!user?.profileImage) return null;
        if (user.profileImage.startsWith("http")) return user.profileImage;
        return `http://127.0.0.1:4000${user.profileImage}`; // 혹은 Firebase URL 그대로 사용
    };

    const [previewUrl, setPreviewUrl] = useState<string | null>(getInitialImage());

    useEffect(() => {
        if (profileImageFileList && profileImageFileList.length > 0) {
            const file = profileImageFileList[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [profileImageFileList]);

    // ✨ 주소 찾기 핸들러 (회원가입과 동일 로직)
    const handleAddressSearch = () => {
        openModal("ADDRESS_SEARCH", {
            onComplete: (data: { zonecode: string; address: string }) => {
                setValue("zipCode", data.zonecode);
                setValue("address1", data.address);
            },
        });
    };

    const onSubmit = async (data: ProfileEditFormData) => {
        // ✨ 제출 전 닉네임 체크 확인
        if (!isNicknameChecked) {
            alert("닉네임 중복 확인을 해주세요.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("nickname", data.nickname);
            formData.append("phoneNumber", data.phoneNumber);
            formData.append("zipCode", data.zipCode);
            formData.append("address1", data.address1);
            formData.append("address2", data.address2);
            formData.append("birthDate", data.birthDate); // ✨ 추가
            formData.append("gender", data.gender); // ✨ 추가

            if (data.profileImage && data.profileImage.length > 0) {
                formData.append("profileImage", data.profileImage[0]);
            }

            // API 요청
            const response = await api.patch("/auth/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // 스토어 업데이트
            if (user) {
                updateUser({
                    ...user,
                    ...response.data.user, // 백엔드에서 보내준 최신 정보(gender, birthDate 포함)로 덮어쓰기
                });
            }

            alert("프로필이 수정되었습니다.");
            navigate("/");
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "프로필 수정 실패";
            alert(msg);
        }
    };

    if (!user) return null;

    return (
        <div className="flex justify-center bg-background-default py-10 px-4 min-h-[calc(100vh-56px)]">
            <div className="w-full max-w-[500px] space-y-6">
                <h1 className="text-2xl font-bold text-text-default text-center">프로필 수정</h1>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 bg-background-paper p-6 rounded-lg border border-divider shadow-sm">
                    {/* 1. 프로필 이미지 */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-divider bg-background-default">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="profile preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-text-disabled bg-secondary-main/10">
                                        {user.nickname ? user.nickname[0].toUpperCase() : "U"}
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-0 right-0 p-2 bg-primary-main text-white rounded-full cursor-pointer hover:bg-primary-dark transition-colors shadow-md">
                                <MdCameraAlt className="w-5 h-5" />
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                {...register("profileImage")}
                            />
                        </div>
                    </div>

                    {/* 2. 기본 정보 */}
                    <div>
                        <div className="flex items-start gap-2">
                            <Input
                                label="닉네임"
                                placeholder="닉네임을 입력하세요"
                                error={errors.nickname?.message}
                                registration={register("nickname", {
                                    required: "닉네임은 필수입니다.",
                                    onChange: () => {
                                        // 닉네임을 변경하려고 시도하면 체크 상태 해제
                                        // 단, 사용자가 다시 원래 닉네임으로 되돌리는 경우도 있어서
                                        // 엄밀히는 원래 닉네임과 다를 때만 false로 해도 되지만,
                                        // UX상 "수정했으면 확인 버튼을 눌러라"가 더 명확할 수 있습니다.
                                        const currentVal = getValues("nickname");
                                        if (currentVal !== user.nickname) {
                                            setIsNicknameChecked(false);
                                            setNicknameMessage("");
                                        } else {
                                            // 다시 원래대로 돌아오면 true로 (선택 사항)
                                            setIsNicknameChecked(true);
                                            setNicknameMessage("");
                                            clearErrors("nickname");
                                        }
                                    },
                                })}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                className={twMerge("text-sm", "w-24", "mt-[26px]")} // 라벨 높이 고려해서 마진 조정
                                onClick={handleCheckNickname}>
                                중복확인
                            </Button>
                        </div>
                        {/* 성공 메시지 표시 */}
                        {isNicknameChecked && nicknameMessage && (
                            <p className="text-success-main text-xs mt-1 ml-1">{nicknameMessage}</p>
                        )}
                    </div>

                    {/* ✨ 생년월일 입력 추가 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-text-default">생년월일</label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-divider bg-background-default px-3 py-2 text-sm text-text-default outline-none focus:border-secondary-main"
                            {...register("birthDate", { required: "생년월일을 선택해주세요." })}
                        />
                    </div>

                    {/* ✨ 성별 선택 추가 (라디오 버튼) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-default">성별</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="MALE"
                                    className="w-4 h-4 text-secondary-main focus:ring-secondary-main"
                                    {...register("gender")}
                                />
                                <span className="text-sm text-text-default">남성</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="FEMALE"
                                    className="w-4 h-4 text-secondary-main focus:ring-secondary-main"
                                    {...register("gender")}
                                />
                                <span className="text-sm text-text-default">여성</span>
                            </label>
                        </div>
                    </div>

                    <Input
                        label="전화번호"
                        placeholder="010-0000-0000"
                        registration={register("phoneNumber")}
                    />

                    {/* 3. 주소 입력 영역 */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-text-default">주소</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="우편번호"
                                className="flex-1 rounded-md border border-divider bg-background-default px-3 py-2 text-sm text-text-default outline-none focus:border-secondary-main"
                                {...register("zipCode")}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                className="text-sm px-3 w-30"
                                onClick={handleAddressSearch}>
                                주소 찾기
                            </Button>
                        </div>
                        <input
                            type="text"
                            placeholder="기본 주소"
                            readOnly
                            className="w-full rounded-md border border-divider bg-background-default px-3 py-2 text-sm text-text-default outline-none focus:border-secondary-main"
                            {...register("address1")}
                        />
                        <input
                            type="text"
                            placeholder="상세 주소"
                            className="w-full rounded-md border border-divider bg-background-default px-3 py-2 text-sm text-text-default outline-none focus:border-secondary-main"
                            {...register("address2")}
                        />
                    </div>

                    {/* 4. 이메일 (읽기 전용) */}
                    <div className="flex flex-col gap-1 opacity-70">
                        <label className="text-sm font-medium text-text-default">이메일</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full rounded-md border border-divider bg-background-default/50 px-3 py-2 text-sm text-text-disabled cursor-not-allowed"
                        />
                    </div>

                    {/* 5. 버튼 */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => navigate(-1)}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? "저장 중..." : "저장하기"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
