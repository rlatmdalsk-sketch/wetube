import { useEffect, useState } from "react";
import { fetchLikedVideos, type Video } from "../../api/video";
import VideoCard from "../../components/video/VideoCard";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router";
import { MdThumbUp } from "react-icons/md";
import { twMerge } from "tailwind-merge"; // 아이콘

export default function LikedVideos() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthStore();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 비로그인 차단
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/sign-in");
            return;
        }

        const loadData = async () => {
            try {
                const data = await fetchLikedVideos();
                setVideos(data);
            } catch (error) {
                console.error("좋아요 목록 로드 실패", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isLoggedIn, navigate]);

    if (loading) return <div className="p-10 text-center text-text-disabled">로딩 중...</div>;

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled gap-4">
                <MdThumbUp className="w-16 h-16 opacity-20" />
                <p className="text-lg">좋아요를 표시한 동영상이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-400 mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <MdThumbUp className="w-8 h-8 text-text-default" />
                <h1 className="text-2xl font-bold text-text-default">좋아요 표시한 동영상</h1>
            </div>

            <div className="flex flex-wrap -mx-2">
                {videos.map(video => (
                    <div
                        className={twMerge(
                            "w-full",
                            "sm:w-1/2",
                            "lg:w-1/3",
                            "xl:w-1/4",
                            "px-2",
                            "mb-8",
                        )}>
                        <VideoCard key={video.id} video={video} />
                    </div>
                ))}
            </div>
        </div>
    );
}
