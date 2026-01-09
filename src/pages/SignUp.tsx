import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios.ts";
import { FaYoutube } from "react-icons/fa";
import Input from "../components/ui/Input.tsx";
import Button from "../components/ui/Button.tsx";
import { twMerge } from "tailwind-merge";
import type { AxiosError } from "axios";
import { useModalStore } from "../store/ModalStore.ts";

interface SignupFormData {
    username: string;
    email: string;
    password: string;
    nickname: string;
    birthDate: string;
    phoneNumber: string;
    gender: "MALE" | "FEMALE";
    zipCode: string;
    address1: string;
    address2?: string;
}

function SignUp() {
    const navigate = useNavigate();
    const { openModal } = useModalStore(); // ✨ 훅 사용

    const [isUsernameChecked, setIsUsernameChecked] = useState(false);
    const [usernameMessage, setUsernameMessage] = useState("");

    // 2. ✨ 닉네임 중복 확인 State 추가
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);
    const [nicknameMessage, setNicknameMessage] = useState("");

    const {
        register,
        handleSubmit,
        getValues,
        setError,
        setValue,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormData>({
        mode: "onBlur",
    });

    const handleCheckUsername = async () => {
        const username = getValues("username");
        if (!username) {
            setError("username", { message: "아이디를 입력해주세요." });
            return;
        }

        try {
            const response = await api.post("/auth/check-username", { username });
            const { isAvailable, message } = response.data;

            if (isAvailable) {
                setIsUsernameChecked(true);
                setUsernameMessage(message);
                clearErrors("username");
            } else {
                setIsUsernameChecked(false);
                setError("username", { message });
            }
        } catch (error) {
            console.error(error);
            setError("username", { message: "중복 확인 중 오류가 발생했습니다." });
        }
    };

    // ✨ 닉네임 중복 확인
    const handleCheckNickname = async () => {
        const nickname = getValues("nickname");
        if (!nickname) {
            setError("nickname", { message: "닉네임을 입력해주세요." });
            return;
        }

        try {
            // 백엔드에 새로 만든 API 호출
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

    // ✨ 주소 찾기 버튼 핸들러
    const handleAddressSearch = () => {
        openModal("ADDRESS_SEARCH", {
            onComplete: (data: { zonecode: string; address: string }) => {
                // 모달에서 주소를 선택하고 나면 이 함수가 실행됩니다.
                // react-hook-form의 setValue로 값을 넣어줍니다.
                setValue("zipCode", data.zonecode, { shouldValidate: true });
                setValue("address1", data.address, { shouldValidate: true });

                // 상세주소로 포커스 이동 (UX 향상)
                document.getElementById("address2")?.focus();
            },
        });
    };

    const onSubmit = async (data: SignupFormData) => {
        if (!isUsernameChecked) {
            alert("아이디 중복 확인을 해주세요.");
            return;
        }
        if (!isNicknameChecked) {
            alert("닉네임 중복 확인을 해주세요.");
            return;
        }

        try {
            await api.post("/auth/signup", data);
            alert("회원가입이 완료되었습니다! 로그인해주세요.");
            navigate("/login");
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const msg = axiosError.response?.data?.message || "회원가입 실패";
            alert(msg);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-background-default py-10 px-4">
            <div
                className={twMerge(
                    ["w-full", "max-w-[500px]", "space-y-8"],
                    "rounded-xl bg-background-paper p-8 shadow-lg border border-divider",
                )}>
                {/* 로고 영역 */}
                <div className="flex flex-col items-center gap-2">
                    <FaYoutube className="h-12 w-12 text-primary-main" />
                    <h1 className="text-2xl font-bold text-text-default">회원가입</h1>
                    <p className="text-text-disabled text-sm">WeTube와 함께하세요</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* 1. 계정 정보 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-default border-b border-divider pb-2">
                            계정 정보
                        </h3>

                        <div className="flex items-start gap-2">
                            <Input
                                label="아이디"
                                placeholder="영문 소문자, 숫자 조합"
                                error={errors.username?.message}
                                // ✨ 이렇게 사용합니다!
                                registration={register("username", {
                                    required: "아이디는 필수입니다.",
                                    minLength: { value: 4, message: "4자 이상 입력해주세요." },
                                    onChange: () => {
                                        setIsUsernameChecked(false);
                                        setUsernameMessage("");
                                    },
                                })}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                className={twMerge("text-sm", "w-24", "mt-6")}
                                onClick={handleCheckUsername}>
                                중복확인
                            </Button>
                        </div>
                        {isUsernameChecked && (
                            <p className="text-success-main text-xs mt-[-10px]">
                                {usernameMessage}
                            </p>
                        )}

                        <Input
                            type="password"
                            label="비밀번호"
                            placeholder="8자 이상 입력"
                            error={errors.password?.message}
                            registration={register("password", {
                                required: "비밀번호는 필수입니다.",
                                minLength: { value: 8, message: "8자 이상이어야 합니다." },
                            })}
                        />

                        <Input
                            label="이메일"
                            type="email"
                            placeholder="example@wetube.com"
                            error={errors.email?.message}
                            registration={register("email", {
                                required: "이메일은 필수입니다.",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "이메일 형식이 아닙니다.",
                                },
                            })}
                        />

                        {/* ✨ 닉네임 입력 & 중복확인 */}
                        <div className="flex items-start gap-2">
                            <Input
                                label="닉네임"
                                placeholder="활동명"
                                error={errors.nickname?.message}
                                registration={register("nickname", {
                                    required: "닉네임은 필수입니다.",
                                    onChange: () => {
                                        // 입력값이 바뀌면 다시 체크
                                        setIsNicknameChecked(false);
                                        setNicknameMessage("");
                                    },
                                })}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                className={twMerge("text-sm", "w-24", "mt-6")}
                                onClick={handleCheckNickname}>
                                중복확인
                            </Button>
                        </div>
                        {isNicknameChecked && (
                            <p className="text-success-main text-xs mt-[-10px]">
                                {nicknameMessage}
                            </p>
                        )}
                    </div>

                    {/* 2. 개인 정보 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-default border-b border-divider pb-2">
                            개인 정보
                        </h3>

                        <div className="flex justify-between gap-4">
                            <Input
                                label="생년월일"
                                type="date"
                                error={errors.birthDate?.message}
                                registration={register("birthDate", {
                                    required: "생년월일을 선택해주세요.",
                                })}
                            />

                            {/* Select는 컴포넌트 따로 안만들고 여기서 스타일링 처리 */}
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-sm font-medium text-text-default">
                                    성별
                                </label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-divider bg-background-default px-3 py-2 text-sm text-text-default focus:border-secondary-main focus:outline-none"
                                    {...register("gender", { required: true })}>
                                    <option value="MALE">남성</option>
                                    <option value="FEMALE">여성</option>
                                </select>
                            </div>
                        </div>

                        <Input
                            label="휴대폰 번호"
                            placeholder="010-0000-0000"
                            error={errors.phoneNumber?.message}
                            registration={register("phoneNumber", {
                                required: "전화번호는 필수입니다.",
                            })}
                        />
                    </div>

                    {/* 3. 주소 정보 */}
                    <div className="space-y-4">
                        <h3
                            className={twMerge(
                                ["text-lg", "font-semibold", "text-text-default"],
                                ["border-b", "border-divider", "pb-2"],
                            )}>
                            주소
                        </h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="우편번호"
                                error={errors.zipCode?.message}
                                readOnly // ✨ 직접 입력 방지
                                onClick={handleAddressSearch} // ✨ 클릭 시 검색창 오픈
                                registration={register("zipCode", { required: "필수" })}
                            />
                            {/* ✨ 버튼에 type="button" 필수! 안 적으면 submit됨 */}
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-30 text-sm"
                                onClick={handleAddressSearch}>
                                주소 찾기
                            </Button>
                        </div>

                        <Input
                            placeholder="기본 주소"
                            readOnly // ✨ 직접 입력 방지
                            onClick={handleAddressSearch}
                            error={errors.address1?.message}
                            registration={register("address1", { required: "필수" })}
                        />

                        {/* 상세 주소에는 id="address2" 추가 (포커스용) */}
                        <Input
                            id="address2"
                            placeholder="상세 주소 (선택)"
                            registration={register("address2")}
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "가입 중..." : "회원가입"}
                    </Button>

                    <p className="text-center text-sm text-text-disabled">
                        이미 계정이 있으신가요?{" "}
                        <Link to="/sign-in" className="text-secondary-main hover:underline">
                            로그인하기
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
