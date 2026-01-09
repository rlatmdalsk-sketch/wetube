import { useEffect, useState } from "react";
import { fetchVideoHistory, type Video } from "../../api/video"; // API 교체
import VideoCard from "../../components/video/VideoCard"; // 경로 확인
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";

export default function VideoHistory() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthStore();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 비로그인 접근 차단
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/sign-in");
            return;
        }

        const loadHistory = async () => {
            try {
                const data = await fetchVideoHistory();
                setVideos(data);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [isLoggedIn, navigate]);

    if (loading) return <div className="p-8 text-center text-text-disabled">로딩 중...</div>;

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled">
                <p className="text-lg">시청한 기록이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold text-text-default mb-6">시청 기록</h1>
            <div className="flex flex-wrap -mx-2">
                {videos.map(video => (
                    <div
                        key={video.id}
                        className={twMerge([
                            "w-full",
                            "sm:w-1/2",
                            "lg:w-1/3",
                            "xl:w-1/4",
                            "px-2",
                            "mb-8",
                        ])}>
                        <VideoCard key={video.id} video={video} />
                    </div>
                ))}
            </div>
        </div>
    );
}
