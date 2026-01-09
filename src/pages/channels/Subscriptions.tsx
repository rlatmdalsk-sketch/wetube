import { useEffect, useState } from "react";
import { fetchSubscribedVideos, type Video } from "../../api/video";
import VideoCard from "../../components/video/VideoCard";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router";
import { MdSubscriptions, MdVideoLibrary } from "react-icons/md";
import { twMerge } from "tailwind-merge";

export default function Subscriptions() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthStore();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/sign-in");
            return;
        }

        const loadData = async () => {
            try {
                const data = await fetchSubscribedVideos();
                setVideos(data);
            } catch (error) {
                console.error("구독 영상 로드 실패", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isLoggedIn, navigate]);

    if (loading) return <div className="p-10 text-center text-text-disabled">로딩 중...</div>;

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-background-paper rounded-full flex items-center justify-center mb-6">
                    <MdSubscriptions className="w-10 h-10 text-text-disabled" />
                </div>
                <h2 className="text-xl font-bold text-text-default mb-2">
                    새로운 동영상을 놓치지 마세요
                </h2>
                <p className="text-text-disabled max-w-md mb-6">
                    즐겨찾는 채널을 구독하면 여기서 최신 동영상을 모아볼 수 있습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-400 mx-auto">
            <h1 className="text-2xl font-bold text-text-default mb-6 flex items-center gap-3">
                <MdVideoLibrary className="text-primary-main" />
                구독
            </h1>

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
