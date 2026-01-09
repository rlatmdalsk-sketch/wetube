import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchVideoDetail, toggleVideoLike, type Video } from "../../api/video.ts";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useAuthStore } from "../../store/authStore.ts";
import { useModalStore } from "../../store/ModalStore.ts";
import { MdThumbUp, MdThumbUpOffAlt } from "react-icons/md";
import { toggleSubscription } from "../../api/subscription.ts";
import CommentList from "../../components/comment/CommentList.tsx";
import Avatar from "../../components/ui/Avatar.tsx";

export default function VideoDetail() {
    const { id } = useParams();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);

    // ✨ 좋아요 상태 관리 (Optimistic UI를 위해 별도 state 사용)
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // ✨ 구독 상태
    const [isSubscribed, setIsSubscribed] = useState(false);

    const { user, isLoggedIn } = useAuthStore();
    const { openModal } = useModalStore();

    const loadData = async (videoId: number) => {
        try {
            const data = await fetchVideoDetail(videoId);
            setVideo(data);
            // 초기 상태 설정
            setIsLiked(data.isLiked || false);
            setLikeCount(data.likeCount);
            setIsSubscribed(data.isSubscribed || false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadData(Number(id));
        }
    }, [id]);

    // ✨ 좋아요 클릭 핸들러
    const handleLikeClick = async () => {
        if (!video) return;

        // 1. 로그인 체크
        if (!isLoggedIn) {
            openModal("LOGIN_REQUIRED");
            return;
        }

        // 2. Optimistic Update (API 응답 전에 미리 UI 변경)
        const prevIsLiked = isLiked;
        const prevCount = likeCount;

        setIsLiked(!prevIsLiked);
        setLikeCount(prevIsLiked ? prevCount - 1 : prevCount + 1);

        try {
            // 3. API 호출
            const result = await toggleVideoLike(video.id);
            // 4. 서버 결과로 확실하게 동기화 (선택 사항)
            setIsLiked(result.isLiked);
        } catch (error) {
            // 실패 시 롤백
            setIsLiked(prevIsLiked);
            setLikeCount(prevCount);
            console.error("좋아요 실패", error);
        }
    };

    // ✨ 구독 핸들러
    const handleSubscribe = async () => {
        if (!video) return;
        if (!isLoggedIn) {
            openModal("LOGIN_REQUIRED");
            return;
        }
        // 내 채널이면 무시
        if (user?.id === video.author.id) {
            alert("본인 채널은 구독할 수 없습니다.");
            return;
        }

        // Optimistic UI
        const prev = isSubscribed;
        setIsSubscribed(!prev);

        try {
            const result = await toggleSubscription(video.author.id);
            setIsSubscribed(result.isSubscribed);
        } catch (error) {
            setIsSubscribed(prev); // 롤백
            console.error(error);
        }
    };

    if (loading) return <div className="pt-20 text-center text-text-disabled">로딩 중...</div>;
    if (!video) return <div className="pt-20 text-center">로딩 중...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-400 mx-auto min-h-screen">
            {/* 왼쪽: 메인 영상 영역 */}
            <div className="flex-1">
                {/* 1. 비디오 플레이어 */}
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    <video src={video.videoPath} controls autoPlay className="w-full h-full" />
                </div>

                {/* 2. 영상 정보 */}
                <div className="mt-4 pb-4 border-b border-divider">
                    <h1 className="text-xl font-bold text-text-default mb-2">{video.title}</h1>
                    <div className="flex items-center justify-between">
                        {/* 작성자 정보 */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <Avatar
                                    src={video.author.profileImage}
                                    nickname={video.author.nickname}
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-text-default text-sm">
                                    {video.author.nickname}
                                </p>
                                <p className="text-xs text-text-disabled">
                                    구독자 {video.subscriberCount || 0}명
                                </p>
                            </div>

                            {/* ✨ 구독 버튼 */}
                            {/* 로그인 유저가 본인이 아닐 때만 노출 */}
                            {user?.id !== video.author.id && (
                                <button
                                    onClick={handleSubscribe}
                                    className={`ml-4 px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity ${
                                        isSubscribed
                                            ? "bg-background-paper text-text-default border border-divider" // 구독중 (회색)
                                            : "bg-text-default text-background-default" // 구독안함 (검정/흰색 반전)
                                    }`}>
                                    {isSubscribed ? "구독중" : "구독"}
                                </button>
                            )}
                        </div>

                        {/* 좋아요/공유 버튼 (UI만) */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleLikeClick}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                                    isLiked
                                        ? "bg-text-default text-background-default border-transparent hover:opacity-90" // 좋아요 누름 (검은 배경)
                                        : "bg-background-paper border-divider text-text-default hover:bg-background-default" // 안 누름 (회색 배경)
                                }`}>
                                {/* 상태에 따라 아이콘 변경 */}
                                {isLiked ? (
                                    <MdThumbUp className="w-5 h-5" />
                                ) : (
                                    <MdThumbUpOffAlt className="w-5 h-5" />
                                )}
                                <span className="text-sm font-medium">{likeCount}</span>
                            </button>

                            <button className="px-4 py-2 rounded-full bg-background-paper border border-divider hover:bg-background-default text-text-default text-sm font-medium transition-colors">
                                공유
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. 설명란 */}
                <div className="mt-4 p-3 bg-background-paper rounded-xl text-sm">
                    <div className="font-semibold text-text-default mb-2">
                        조회수 {video.views}회 • {dayjs(video.createdAt).format("YYYY. MM. DD.")}
                    </div>
                    <p className="text-text-default whitespace-pre-wrap leading-relaxed">
                        {video.description}
                    </p>
                </div>

                {/* ✨ 댓글 컴포넌트 추가 */}
                <CommentList videoId={Number(id)} />
            </div>

            {/* 오른쪽: 추천 영상 목록 (일단 빈 공간) */}
            <div className="lg:w-87.5 hidden lg:block">
                <p className="text-text-default font-bold mb-4">다음 동영상</p>
                <div className="space-y-3">
                    {/* 여기에 VideoCard(가로형) 컴포넌트를 나중에 추가하면 됩니다 */}
                    <div className="h-24 bg-background-paper rounded-lg border border-divider flex items-center justify-center text-text-disabled text-sm">
                        추천 영상 영역
                    </div>
                    <div className="h-24 bg-background-paper rounded-lg border border-divider flex items-center justify-center text-text-disabled text-sm">
                        추천 영상 영역
                    </div>
                </div>
            </div>
        </div>
    );
}
