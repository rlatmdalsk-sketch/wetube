import { twMerge } from "tailwind-merge";

interface AvatarProps {
    src?: string | null; // 프로필 이미지 URL (없을 수도 있음)
    nickname: string; // ✨ 닉네임 (무조건 있음)
    size?: "xs" | "sm" | "md" | "lg" | "xl"; // 크기 옵션
    onClick?: VoidFunction;
    className?: string; // 추가 스타일
}

export default function Avatar({ src, nickname, size = "md", onClick, className }: AvatarProps) {
    // 사이즈별 클래스 정의
    const sizeClasses = {
        xs: "w-6 h-6",
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
        xl: "w-32 h-32", // 프로필 수정 페이지용
    };

    return (
        <div
            className={twMerge(
                "rounded-full overflow-hidden bg-background-paper border border-divider shrink-0 flex items-center justify-center relative",
                sizeClasses[size],
                className,
            )}
            onClick={onClick}>
            {src ? (
                <img src={src} alt={nickname} className="w-full h-full object-cover" />
            ) : (
                // 이미지가 없을 때 보여줄 기본 아이콘 또는 이니셜
                <div className="w-full h-full flex items-center justify-center bg-primary-main text-white">
                    <span className="font-bold opacity-80">
                        {/* 닉네임이 혹시라도 비어있을 경우 대비해 안전하게 접근 */}
                        {nickname[0].toUpperCase()}
                    </span>
                </div>
            )}
        </div>
    );
}
