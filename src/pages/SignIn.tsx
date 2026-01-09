import { useForm } from "react-hook-form";
import { api } from "../api/axios";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { FaYoutube } from "react-icons/fa";
import { Link, useNavigate } from "react-router";
import type { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore.ts";

interface LoginFormData {
    username: string;
    password: string;
}

function SignIn() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        mode: "onBlur",
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            // 1. 로그인 요청
            const response = await api.post("/auth/login", data);

            // 2. 응답 데이터 추출 (토큰, 유저정보)
            const { token, user } = response.data;

            login(token, user);

            alert(`${user.nickname}님 환영합니다!`);
            navigate("/"); // 홈으로 이동
        } catch (error) {
            console.error(error);
            const axiosError = error as AxiosError<{ message: string }>;
            const message = axiosError.response?.data?.message || "로그인에 실패했습니다.";
            // 에러를 폼 상단이나 비밀번호 필드에 표시
            setError("root", { message });
            setError("password", { message }); // 비밀번호 밑에도 빨간 글씨 띄우기
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-background-default py-10 px-4">
            <div className="w-full max-w-[400px] space-y-8 rounded-xl bg-background-paper p-8 shadow-lg border border-divider">
                {/* 로고 & 타이틀 */}
                <div className="flex flex-col items-center gap-2">
                    <FaYoutube className="h-12 w-12 text-primary-main" />
                    <h1 className="text-2xl font-bold text-text-default">로그인</h1>
                    <p className="text-text-disabled text-sm">WeTube 계정으로 이동</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="아이디"
                            placeholder="아이디 입력"
                            error={errors.username?.message}
                            registration={register("username", {
                                required: "아이디를 입력해주세요.",
                            })}
                        />

                        <Input
                            type="password"
                            label="비밀번호"
                            placeholder="비밀번호 입력"
                            error={errors.password?.message}
                            registration={register("password", {
                                required: "비밀번호를 입력해주세요.",
                            })}
                        />
                    </div>

                    {/* 서버 에러 메시지 표시 영역 */}
                    {errors.root && (
                        <div className="p-3 bg-error-main/10 border border-error-main/20 rounded text-error-main text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "로그인 중..." : "로그인"}
                    </Button>

                    <div className="flex justify-between text-sm mt-4">
                        <Link
                            to="/sign-up"
                            className="text-secondary-main hover:underline font-medium">
                            계정 만들기
                        </Link>
                        <Link to="#" className="text-text-disabled hover:text-text-default">
                            비밀번호 찾기
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignIn;
