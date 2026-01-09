import { useEffect, useState, useRef, useCallback } from "react";
import { fetchVideos, type Video } from "../api/video";
import VideoCard from "../components/video/VideoCard";
import { twMerge } from "tailwind-merge";
import { MdRefresh } from "react-icons/md";

export default function Home() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true); // 초기 로딩
    const [fetching, setFetching] = useState(false); // 추가 데이터 로딩 중
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    // 무한 스크롤 감지용 ref
    const observerTarget = useRef<HTMLDivElement>(null);

    // 데이터 불러오기 함수
    const loadVideos = useCallback(async (pageNum: number) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setFetching(true);

            // API 호출 (page, limit 전달)
            const data = await fetchVideos(pageNum, 12); // 모바일/데스크탑 고려해 12개씩

            setVideos(prev => {
                // 첫 페이지면 덮어쓰기, 아니면 뒤에 붙이기
                if (pageNum === 1) return data.videos;
                // 중복 제거 (혹시 모를 키 에러 방지)
                const newVideos = data.videos.filter(
                    newV => !prev.some(prevV => prevV.id === newV.id),
                );
                return [...prev, ...newVideos];
            });

            setHasNextPage(data.hasNextPage);
        } catch (error) {
            console.error("Failed to load videos", error);
        } finally {
            setLoading(false);
            setFetching(false);
        }
    }, []);

    // 1. 초기 로드
    useEffect(() => {
        loadVideos(1).then(() => {});
    }, [loadVideos]);

    // 2. 무한 스크롤 Observer 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                // 타겟이 화면에 보이고, 다음 페이지가 있고, 로딩 중이 아닐 때
                if (entries[0].isIntersecting && hasNextPage && !loading && !fetching) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.5 }, // 50% 보였을 때 트리거
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, loading, fetching]);

    // 3. 페이지 번호가 바뀌면 데이터 로드
    useEffect(() => {
        if (page > 1) {
            loadVideos(page);
        }
    }, [page, loadVideos]);

    // 초기 로딩 중
    if (loading && page === 1) {
        return <div className="p-20 text-center text-text-disabled">로딩 중...</div>;
    }

    // 데이터가 아예 없을 때
    if (videos.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-text-disabled gap-4">
                <p className="text-lg">등록된 영상이 없습니다.</p>
                <button
                    onClick={() => loadVideos(1)}
                    className="flex items-center gap-2 px-4 py-2 bg-background-paper border border-divider rounded-full hover:bg-background-default transition-colors">
                    <MdRefresh /> 다시 불러오기
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-400 mx-auto">
            {/* 비디오 그리드 */}
            <div className="flex flex-wrap -mx-2">
                {videos.map(video => (
                    <div
                        key={video.id}
                        className={twMerge([
                            "w-full",
                            "sm:w-1/2",
                            "lg:w-1/3",
                            "xl:w-1/4", // 2xl 화면 대응
                            "2xl:w-1/5",
                            "px-2",
                            "mb-6 sm:mb-8",
                        ])}>
                        <VideoCard video={video} />
                    </div>
                ))}
            </div>

            {/* 무한 스크롤 감지 센서 (Sentinel) & 로딩 인디케이터 */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center w-full mt-4">
                {fetching && (
                    <div className="w-6 h-6 border-2 border-text-disabled border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {/* 더 이상 불러올 데이터가 없을 때 표시 (데이터가 꽤 쌓였을 때만) */}
            {!hasNextPage && videos.length > 0 && (
                <div className="text-center text-sm text-text-disabled py-10">
                    모든 동영상을 불러왔습니다.
                </div>
            )}
        </div>
    );
}
