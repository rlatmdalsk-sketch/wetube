import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { searchVideos, type Video } from "../../api/video";
import VideoCard from "../../components/video/VideoCard";
import { MdSearchOff } from "react-icons/md";
import { twMerge } from "tailwind-merge";

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || ""; // URL의 ?q= 값 가져오기

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const data = await searchVideos(query);
                setVideos(data);
            } catch (error) {
                console.error("검색 실패", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]); // query가 바뀔 때마다 재검색

    if (!query) {
        return <div className="p-10 text-center text-text-disabled">검색어를 입력해주세요.</div>;
    }

    if (loading) {
        return <div className="p-10 text-center text-text-disabled">검색 중...</div>;
    }

    return (
        <div className="p-4 sm:p-6 max-w-400 mx-auto">
            <h1 className="text-xl font-bold text-text-default mb-6">'{query}' 검색 결과</h1>

            {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled">
                    <MdSearchOff className="w-16 h-16 opacity-20 mb-4" />
                    <p>검색 결과가 없습니다.</p>
                </div>
            ) : (
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
            )}
        </div>
    );
}
